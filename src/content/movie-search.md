---
title: "Movie Search with Feature Vectors and Cosine Similarity"
description: "Follow a Java movie-search demo from query keywords to feature vectors, cosine scores, and ranked results, with a worked example and its limitations."
createdAt: "2026-09-28"
publishedAt: "2026-09-28"
updatedAt: "2026-09-28"
section: "gen-ai"
tags: ["Gen AI", "Java", "Vector Search", "Cosine Similarity"]
---

**Movie search gives me a small, inspectable way to understand vector similarity.** A query becomes a set of feature IDs, each movie has its own features, and a scoring function ranks the overlap. I can follow every step without calling a model.

In my [movie-search project](https://github.com/malviys/gen-ai/tree/main/movie-search), I use Java and Spring Boot to expose that process through an HTTP endpoint. This chapter follows the local implementation and bundled data as of September 28, 2026. The linked project README describes setup; the source files discussed here still need to be committed to the public repository.

By [Sourabh Malviya](/) · Part of [Gen AI](/blog/gen-ai).

> **Key Takeaways**
> - The demo maps known query words to feature IDs and compares them with each movie's features.
> - The active cosine calculation treats every present feature equally, even though the data contains weights.
> - This is dictionary-based retrieval. It doesn't generate answers or use learned query embeddings.

## Start with a shared feature dictionary

The query and movie catalog must use the same feature IDs for a comparison to mean anything. The demo loads two local JSON resources when the service starts: `feature_embedding.json` maps words to IDs, and `movies_embedding.json` stores movie records and their feature weights.

The checked-in README refers to these files under `src/main/resources/embeddings/`. In the local dataset used for this walkthrough, there are 1,629 dictionary entries and 100 movies. These are counts from the supplied files, not measurements of search quality.

For the running example, these three dictionary entries matter:

| Word | Feature ID |
| --- | --- |
| `astronaut` | `103` |
| `space` | `1364` |
| `survival` | `1429` |

A feature ID is a label for a coordinate. The number `1364` doesn't mean that “space” is stronger than “astronaut,” and nearby IDs don't imply related meanings.

The movie data stores weights such as `1.0`, `0.85`, and `0.65`. However, the current search method passes `movie.embedding().keySet()` to the scorer. That discards the values and retains only the set of feature IDs. The effective representation is binary: a coordinate is present or absent.

## Turn the query into features

The query `space astronaut survival` becomes the set `{1364, 103, 1429}`. In `MovieSearchService`, the conversion lowercases the input, splits it into tokens, looks up each token in the dictionary, and adds recognized IDs to a `HashSet`.

<figure style="max-width: 480px; margin: 2rem auto;">
  <img src="/images/blog/movie-search/search-flow.svg" alt="The query space astronaut survival becomes three tokens, then feature IDs 1364, 103, and 1429; cosine scores rank The Martian, Gravity, and Interstellar first." width="480" height="868" loading="lazy" decoding="async" />
  <figcaption>The local search pipeline maps words to unique feature IDs, scores every movie, and returns the highest positive matches. Source: the movie-search implementation, September 28, 2026.</figcaption>
</figure>

The token splitter is defined as:

```java
private static final Pattern TOKEN_SPLITTER =
        Pattern.compile("[^a-zA-Z0-9]+");
```

This expression splits on anything other than ASCII letters and digits. It makes punctuation a separator, but it doesn't provide general multilingual tokenization.

Using a set has two consequences. Repeating `space` doesn't increase its influence, and word order disappears. Unknown words are ignored. A blank query, or one containing no dictionary words, produces no query features and returns an empty result list.

For example, adding an unknown word to `space astronaut survival` leaves the score unchanged. There is no stemming or synonym expansion, so a word variation only matches if that exact token has a dictionary entry. This makes the conversion easy to inspect, while also setting a clear limit on what the search understands.

## Calculate cosine similarity

Cosine similarity compares vectors through their dot product divided by the product of their lengths. The [Stanford information retrieval textbook's explanation of dot products](https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html) describes this normalization. For this demo's binary vectors, the calculation reduces to:

```text
score = number of shared features
        / sqrt(query feature count × movie feature count)
```

The method below is the scorer from `MovieSearchService`. It accepts two sets of integer IDs, handles empty sets, and counts their intersection:

```java
private double cosineSimilarity(Set<Integer> query, Set<Integer> movie) {
    if (query.isEmpty() || movie.isEmpty()) {
        return 0.0;
    }

    var smaller = query.size() <= movie.size() ? query : movie;
    var larger = query.size() <= movie.size() ? movie : query;

    long intersection = smaller.stream().filter(larger::contains).count();

    if (intersection == 0) {
        return 0.0;
    }

    return intersection / Math.sqrt((double) query.size() * movie.size());
}
```

This is a method excerpt, not a standalone Java program; `Set` comes from `java.util`. Iterating over the smaller set reduces the number of membership checks for each comparison.

### Work through an actual ranking

For `space astronaut survival`, the query has three recognized features. The Martian has 13 features in the supplied data, including all three query features. Its score is `3 / sqrt(3 × 13)`, or approximately `0.480384`.

I calculated the following values directly from the local JSON files using the same set-based formula. They are a reproducible calculation from this data snapshot, not a captured HTTP response or a relevance benchmark.

| Movie | Shared features | Movie features | Score, rounded |
| --- | --- | --- | --- |
| The Martian | 3 | 13 | 0.480384 |
| Gravity | 3 | 14 | 0.462910 |
| Interstellar | 3 | 17 | 0.420084 |
| Alien | 2 | 14 | 0.308607 |
| WALL-E | 2 | 14 | 0.308607 |

<figure style="max-width: 480px; margin: 2rem auto;">
  <img src="/images/blog/movie-search/ranking-scores.svg" alt="On a zero-to-one cosine scale, The Martian scores 0.480384, Gravity 0.462910, Interstellar 0.420084, and Alien and WALL-E each 0.308607. The first three share all three query features but have 13, 14, and 17 total features." width="480" height="800" loading="lazy" decoding="async" />
  <figcaption>All three leading movies match the query's three features. Their different total feature counts change the cosine denominator and ranking. Source: calculations from the bundled movie-search JSON, September 28, 2026; scores are not probabilities.</figcaption>
</figure>

2001: A Space Odyssey has the same score as the last two rows. Equal scores retain catalog order in this implementation, so the five-result limit leaves it out. There is no separate tie-breaker based on release year, popularity, or title.

The first three movies match the same query features, but their scores differ because the denominator includes every feature attached to each movie. With equal overlap, a movie with fewer total features receives a higher score. That is a property of this representation and formula; it doesn't establish which movie a person would prefer.

The score also isn't a probability. A result of `0.480384` doesn't mean the movie has a 48% chance of satisfying the request.

## Follow the search endpoint

The controller exposes `GET /api/movies/search`. It requires `query`, defaults `topK` to `10`, and clamps that result limit between `1` and `100` before calling the service.

The service scores every movie, removes results whose score is zero, sorts the remaining results in descending order, and returns up to `topK` records. Each JSON result contains `id`, `title`, and `score`. The implementation scans the in-memory catalog; it doesn't use a vector database or a nearest-neighbor index.

With the complete local project available, use JDK 27 as specified in its build file. From the `movie-search` directory, start the application with its Maven wrapper:

```sh
./mvnw spring-boot:run
```

The initial run needs access to Maven dependencies. Search itself needs no provider credentials or database. In another terminal:

```sh
curl --get 'http://localhost:8080/api/movies/search' \
  --data-urlencode 'query=space astronaut survival' \
  --data-urlencode 'topK=5'
```

For the data snapshot above, the ranking should match the table, with full-precision scores in the response. Requesting five results sets an upper bound: if only two movies have positive scores, the endpoint returns two.

To inspect the query conversion, try repeating `space`, changing the query to uppercase, or submitting a blank value. Repetition and letter case should preserve the ranking; a blank value should produce `[]`. Omitting the required `query` parameter is a different case and results in a request error.

## Keep the limits visible

This example makes vector retrieval concrete because the coordinates have readable labels. Its limitations follow directly from those choices:

- **Vocabulary controls recall.** Words outside the dictionary contribute nothing. Adding a synonym requires defining how it maps into the existing representation.
- **Weights are currently ignored.** Using weighted cosine similarity would require changing both the dot product and the vector lengths to account for weights.
- **Feature coverage shapes ranking.** Adding features to a movie can lower its score for a query when the overlap stays the same.
- **Every request scans the catalog.** The example is useful for learning, but it provides no measured performance claim for a larger collection.

A useful next experiment is to create a small set of queries with expected relevant movies, then compare the current binary scoring with a weighted version. That gives the ranking changes something concrete to be judged against.

Learned text embeddings would be another experiment: replace the dictionary lookup and movie feature representation with vectors produced by a compatible embedding model, then evaluate the retrieval results. That would change the representation and its behavior; it isn't a capability implemented by this demo.

The connection to the rest of [this Gen AI series](/blog/gen-ai) is retrieval: select useful records before deciding what to do with them. The [tool-calling chapter](/blog/tool-calling) covers how an application exposes executable capabilities to a model. A future integration could expose movie search as one of those capabilities, but the current endpoint returns ranked records directly.
