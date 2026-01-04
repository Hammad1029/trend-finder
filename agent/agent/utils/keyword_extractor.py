import re
import numpy as np
from collections import Counter, defaultdict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import DBSCAN
from typing import List, Dict, Tuple, Any
import string


class ClusterKeywordExtractor:
    """
    Robust system for extracting meaningful labels from clustered e-commerce product descriptions.
    Combines multiple techniques: TF-IDF, n-gram frequency, brand filtering, and phrase extraction.
    """

    def __init__(self):
        # Common e-commerce noise words to filter
        self.noise_words = {
            "new",
            "original",
            "genuine",
            "premium",
            "high",
            "quality",
            "best",
            "great",
            "perfect",
            "ideal",
            "top",
            "brand",
            "rated",
            "pack",
            "set",
            "piece",
            "pcs",
            "item",
            "product",
            "sale",
            "deal",
            "offer",
            "buy",
            "get",
            "free",
            "shipping",
            "amazon",
            "ebay",
            "walmart",
            "official",
            "authentic",
            "certified",
            "guaranteed",
            "warranty",
            "hot",
            "latest",
        }

        # Common measurement/specification patterns
        self.spec_patterns = [
            r"\b\d+\s*(gb|mb|tb|kg|g|lb|oz|mm|cm|m|inch|in|ft|ml|l)\b",
            r"\b\d+[\s-]*pack\b",
            r"\b\d+x\d+\b",
            r"\bsize\s+\w+\b",
            r"\bcolor[:\s]+\w+\b",
        ]

        # Brand name indicators (usually capitalized, short)
        self.brand_indicators = r"\b[A-Z][A-Z0-9]{2,15}\b"

    def preprocess_text(self, text: str, remove_brands: bool = True) -> str:
        """
        Clean and normalize product description text.
        """
        if not isinstance(text, str):
            return ""

        text = text.lower()

        # Remove URLs
        text = re.sub(r"http\S+|www\.\S+", "", text)

        # Remove specifications and measurements
        for pattern in self.spec_patterns:
            text = re.sub(pattern, "", text, flags=re.IGNORECASE)

        # Remove brand names (all caps words)
        if remove_brands:
            text = re.sub(self.brand_indicators, "", text)

        # Remove special characters but keep spaces and hyphens
        text = re.sub(r"[^\w\s-]", " ", text)

        # Remove numbers (keep words with numbers like "3d")
        text = re.sub(r"\b\d+\b", "", text)

        # Remove noise words
        words = text.split()
        words = [w for w in words if w not in self.noise_words and len(w) > 2]

        # Remove extra whitespace
        text = " ".join(words)

        return text.strip()

    def extract_ngrams(
        self, texts: List[str], n: int = 2, min_freq: int = 2
    ) -> List[Tuple[str, int]]:
        """
        Extract frequent n-grams from a list of texts.
        """
        ngram_counter = Counter()

        for text in texts:
            words = text.split()
            if len(words) < n:
                continue

            for i in range(len(words) - n + 1):
                ngram = " ".join(words[i : i + n])
                # Filter out ngrams with very short words
                if all(len(w) > 2 for w in ngram.split()):
                    ngram_counter[ngram] += 1

        # Return ngrams that appear at least min_freq times
        return [
            (ngram, count)
            for ngram, count in ngram_counter.most_common()
            if count >= min_freq
        ]

    def get_tfidf_keywords(
        self, texts: List[str], top_n: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Extract top keywords using TF-IDF, focusing on phrases.
        """
        if len(texts) < 2:
            # If only one text, just return top words
            words = Counter(texts[0].split())
            return [
                (str(word), float(count)) for word, count in words.most_common(top_n)
            ]

        # Use 1-3 grams to capture phrases
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=500,
            min_df=int(min(2, max(1, len(texts) * 0.1))),  # Adaptive min_df
            max_df=0.8,  # Ignore terms in >80% of docs
            stop_words="english",
        )

        try:
            tfidf_matrix: Any = vectorizer.fit_transform(texts)
            feature_names = vectorizer.get_feature_names_out()

            # Sum TF-IDF scores across all documents
            scores = np.asarray(tfidf_matrix.sum(axis=0)).flatten()

            # Get top scoring terms
            top_indices = scores.argsort()[-top_n:][::-1]
            keywords = [(str(feature_names[i]), float(scores[i])) for i in top_indices]

            return keywords
        except:
            # Fallback to word frequency if TF-IDF fails
            all_words = " ".join(texts).split()
            word_freq = Counter(all_words)
            return [
                (str(word), float(count))
                for word, count in word_freq.most_common(top_n)
            ]

    def score_phrases(
        self, phrases: List[str], cluster_texts: List[str]
    ) -> Dict[str, float]:
        """
        Score phrases based on multiple criteria:
        - Coverage: how many texts contain the phrase
        - Specificity: length and meaningfulness
        - Position: early appearance in text (product names usually come first)
        """
        scores = {}
        num_texts = len(cluster_texts)

        for phrase in phrases:
            # Coverage score
            coverage = sum(1 for text in cluster_texts if phrase in text) / num_texts

            # Length score (prefer 2-3 word phrases)
            words = phrase.split()
            length_score = min(len(words) / 3, 1.0)

            # Position score (prefer phrases that appear early)
            positions = []
            for text in cluster_texts:
                if phrase in text:
                    pos = text.index(phrase)
                    positions.append(pos / max(len(text), 1))
            position_score = 1 - (np.mean(positions) if positions else 1)

            # Combined score
            scores[phrase] = coverage * 0.5 + length_score * 0.3 + position_score * 0.2

        return scores

    def extract_cluster_keywords(
        self, cluster_texts: List[str], top_n: int = 10, min_cluster_size: int = 2
    ) -> Dict:
        """
        Extract all relevant keywords/phrases for a cluster, ranked by score.

        Parameters:
        -----------
        cluster_texts : List[str]
            Raw product descriptions in the cluster
        top_n : int
            Number of top keywords to return
        min_cluster_size : int
            Minimum size to process (skip noise)

        Returns:
        --------
        Dict with keys: 'keywords' (list of tuples), 'cluster_size'
        """
        if len(cluster_texts) < min_cluster_size:
            return {
                "keywords": [],
                "cluster_size": len(cluster_texts),
                "method": "size_filter",
            }

        # Preprocess texts
        processed_texts = [self.preprocess_text(t) for t in cluster_texts]
        processed_texts = [t for t in processed_texts if t]  # Remove empty

        if not processed_texts:
            return {
                "keywords": [],
                "cluster_size": len(cluster_texts),
                "method": "empty_after_processing",
            }

        candidates = []

        # Method 1: TF-IDF keywords
        tfidf_keywords = self.get_tfidf_keywords(processed_texts, top_n=20)
        candidates.extend([kw for kw, score in tfidf_keywords])

        # Method 2: Frequent bigrams and trigrams
        for n in [2, 3]:
            ngrams = self.extract_ngrams(
                processed_texts, n=n, min_freq=max(2, len(processed_texts) // 3)
            )
            candidates.extend([ng for ng, count in ngrams[:10]])

        # Method 3: Most common single words
        all_words = " ".join(processed_texts).split()
        word_freq = Counter(all_words).most_common(15)
        candidates.extend([word for word, count in word_freq if len(word) > 3])

        # Score all candidates
        phrase_scores = self.score_phrases(candidates, processed_texts)

        # Sort by score and return top N
        sorted_phrases = sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)

        # Return as list of (keyword, score) tuples
        keywords = sorted_phrases[:top_n]

        return {
            "keywords": keywords,
            "cluster_size": len(cluster_texts),
            "method": "combined",
        }

    def label_all_clusters(
        self, texts: List[str], cluster_labels: np.ndarray, top_n: int = 10
    ) -> Dict[int, Dict]:
        """
        Get keywords for all clusters from DBSCAN results.

        Parameters:
        -----------
        texts : List[str]
            All product descriptions
        cluster_labels : np.ndarray
            Cluster assignments from DBSCAN (includes -1 for noise)
        top_n : int
            Number of keywords to return per cluster

        Returns:
        --------
        Dict mapping cluster_id -> cluster info with keywords list
        """
        clusters = defaultdict(list)

        # Group texts by cluster
        for text, label in zip(texts, cluster_labels):
            clusters[label].append(text)

        # Get keywords for each cluster
        results = {}
        for cluster_id, cluster_texts in clusters.items():
            if cluster_id == -1:
                results[cluster_id] = {
                    "keywords": [],
                    "cluster_size": len(cluster_texts),
                    "method": "noise",
                    "sample_texts": cluster_texts[:3],
                }
            else:
                keyword_info = self.extract_cluster_keywords(cluster_texts, top_n=top_n)
                keyword_info["sample_texts"] = cluster_texts[:3]
                results[cluster_id] = keyword_info

        return results


# Example usage
def example_usage():
    """
    Demonstrate the cluster labeling system with sample e-commerce data.
    """
    # Sample product descriptions
    product_descriptions = [
        "SCIONE Fidget Spinner Toy Ultra Durable Stainless Steel Bearing High Speed",
        "Fidget Spinner - RED Color Metal Hand Spinner for Anxiety Stress Relief",
        "Anti-Anxiety Fidget Spinner Toy 360 Degree Rotation Premium Quality",
        "POPIT Bubble Sensory Fidget Toy Pack Square Shape Rainbow Colors",
        "Pop It Fidget Toy Silicone Stress Relief Sensory Toys for Kids",
        "Rainbow Pop It Push Bubble Fidget Sensory Toy Autism Special Needs",
        "Rubiks Cube 3x3 Speed Cube Magic Puzzle Game Brain Teaser",
        "Magic Cube 3x3x3 Professional Speed Cube Puzzle Toy",
    ]

    # Simulate embeddings (in real use, you'd have actual embeddings)
    from sklearn.feature_extraction.text import TfidfVectorizer

    vectorizer = TfidfVectorizer()
    tfidf_result: Any = vectorizer.fit_transform(product_descriptions)
    embeddings = tfidf_result.toarray()

    # Cluster your embeddings
    clustering = DBSCAN(eps=0.5, min_samples=2, metric="cosine")
    cluster_labels = clustering.fit_predict(embeddings)

    # Get keywords for clusters
    labeler = ClusterKeywordExtractor()
    cluster_info = labeler.label_all_clusters(
        product_descriptions, cluster_labels, top_n=10
    )

    # Print results
    print("=" * 80)
    print("CLUSTER KEYWORDS RESULTS")
    print("=" * 80)

    for cluster_id, info in sorted(cluster_info.items()):
        print(f"\nCluster {cluster_id}:")
        print(f"  Size: {info['cluster_size']} products")
        print(f"  Keywords (ranked by relevance):")
        for i, (keyword, score) in enumerate(info["keywords"], 1):
            print(f"    {i}. '{keyword}' (score: {score:.3f})")
        print(f"  Sample products:")
        for i, text in enumerate(info["sample_texts"][:2], 1):
            print(f"    {i}. {text[:70]}...")

    return labeler, cluster_info


# Alias for compatibility with other nodes
ClusterLabeler = ClusterKeywordExtractor


if __name__ == "__main__":
    labeler, results = example_usage()
