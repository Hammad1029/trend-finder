"""
Cluster keyword extraction service.

Extracts meaningful labels/keywords from clustered product descriptions
using TF-IDF, n-gram frequency, and phrase scoring.
"""

import re
from collections import Counter, defaultdict
from typing import List, Dict, Tuple, Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer


class ClusterKeywordExtractor:
    """
    Service for extracting meaningful labels from clustered e-commerce products.

    Combines multiple techniques:
    - TF-IDF keyword extraction
    - N-gram frequency analysis
    - Brand/noise filtering
    - Phrase scoring
    """

    def __init__(self):
        # Common e-commerce noise words
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

        # Measurement/specification patterns
        self.spec_patterns = [
            r"\b\d+\s*(gb|mb|tb|kg|g|lb|oz|mm|cm|m|inch|in|ft|ml|l)\b",
            r"\b\d+[\s-]*pack\b",
            r"\b\d+x\d+\b",
            r"\bsize\s+\w+\b",
            r"\bcolor[:\s]+\w+\b",
        ]

        # Brand name indicator pattern
        self.brand_pattern = r"\b[A-Z][A-Z0-9]{2,15}\b"

    def preprocess_text(self, text: str, remove_brands: bool = True) -> str:
        """Clean and normalize product description text."""
        if not isinstance(text, str):
            return ""

        text = text.lower()

        # Remove URLs
        text = re.sub(r"http\S+|www\.\S+", "", text)

        # Remove specifications
        for pattern in self.spec_patterns:
            text = re.sub(pattern, "", text, flags=re.IGNORECASE)

        # Remove brand names
        if remove_brands:
            text = re.sub(self.brand_pattern, "", text)

        # Remove special characters
        text = re.sub(r"[^\w\s-]", " ", text)

        # Remove standalone numbers
        text = re.sub(r"\b\d+\b", "", text)

        # Remove noise words and short words
        words = [w for w in text.split() if w not in self.noise_words and len(w) > 2]

        return " ".join(words).strip()

    def extract_ngrams(
        self, texts: List[str], n: int = 2, min_freq: int = 2
    ) -> List[Tuple[str, int]]:
        """Extract frequent n-grams from texts."""
        ngram_counter: Counter = Counter()

        for text in texts:
            words = text.split()
            if len(words) < n:
                continue

            for i in range(len(words) - n + 1):
                ngram = " ".join(words[i : i + n])
                if all(len(w) > 2 for w in ngram.split()):
                    ngram_counter[ngram] += 1

        return [
            (ngram, count)
            for ngram, count in ngram_counter.most_common()
            if count >= min_freq
        ]

    def get_tfidf_keywords(
        self, texts: List[str], top_n: int = 10
    ) -> List[Tuple[str, float]]:
        """Extract top keywords using TF-IDF."""
        if len(texts) < 2:
            words = Counter(texts[0].split()) if texts else Counter()
            return [(str(w), float(c)) for w, c in words.most_common(top_n)]

        vectorizer = TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=500,
            min_df=int(min(2, max(1, len(texts) * 0.1))),
            max_df=0.8,
            stop_words="english",
        )

        try:
            tfidf_matrix: Any = vectorizer.fit_transform(texts)
            feature_names = vectorizer.get_feature_names_out()
            scores = np.asarray(tfidf_matrix.sum(axis=0)).flatten()

            top_indices = scores.argsort()[-top_n:][::-1]
            return [(str(feature_names[i]), float(scores[i])) for i in top_indices]
        except Exception:
            # Fallback to word frequency
            all_words = " ".join(texts).split()
            word_freq = Counter(all_words)
            return [(str(w), float(c)) for w, c in word_freq.most_common(top_n)]

    def score_phrases(
        self, phrases: List[str], cluster_texts: List[str]
    ) -> Dict[str, float]:
        """Score phrases based on coverage, specificity, and position."""
        scores = {}
        num_texts = len(cluster_texts)

        for phrase in phrases:
            # Coverage score
            coverage = sum(1 for text in cluster_texts if phrase in text) / num_texts

            # Length score (prefer 2-3 word phrases)
            words = phrase.split()
            length_score = min(len(words) / 3, 1.0)

            # Position score (prefer early appearance)
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
        self,
        cluster_texts: List[str],
        top_n: int = 10,
        min_cluster_size: int = 2,
    ) -> Dict[str, Any]:
        """
        Extract all relevant keywords/phrases for a cluster.

        Returns dict with 'keywords' (list of tuples) and 'cluster_size'.
        """
        if len(cluster_texts) < min_cluster_size:
            return {
                "keywords": [],
                "cluster_size": len(cluster_texts),
                "method": "size_filter",
            }

        # Preprocess
        processed_texts = [self.preprocess_text(t) for t in cluster_texts]
        processed_texts = [t for t in processed_texts if t]

        if not processed_texts:
            return {
                "keywords": [],
                "cluster_size": len(cluster_texts),
                "method": "empty_after_processing",
            }

        candidates = []

        # TF-IDF keywords
        tfidf_keywords = self.get_tfidf_keywords(processed_texts, top_n=20)
        candidates.extend([kw for kw, _ in tfidf_keywords])

        # N-grams
        for n in [2, 3]:
            ngrams = self.extract_ngrams(
                processed_texts, n=n, min_freq=max(2, len(processed_texts) // 3)
            )
            candidates.extend([ng for ng, _ in ngrams[:10]])

        # Common single words
        all_words = " ".join(processed_texts).split()
        word_freq = Counter(all_words).most_common(15)
        candidates.extend([word for word, _ in word_freq if len(word) > 3])

        # Score and sort
        phrase_scores = self.score_phrases(candidates, processed_texts)
        sorted_phrases = sorted(phrase_scores.items(), key=lambda x: x[1], reverse=True)

        return {
            "keywords": sorted_phrases[:top_n],
            "cluster_size": len(cluster_texts),
            "method": "combined",
        }

    def label_all_clusters(
        self,
        texts: List[str],
        cluster_labels: np.ndarray,
        top_n: int = 10,
    ) -> Dict[int, Dict]:
        """
        Get keywords for all clusters from DBSCAN results.

        Args:
            texts: All product descriptions
            cluster_labels: Cluster assignments from DBSCAN (-1 = noise)
            top_n: Number of keywords per cluster

        Returns:
            Dict mapping cluster_id -> cluster info with keywords
        """
        clusters: Dict[int, List[str]] = defaultdict(list)

        for text, label in zip(texts, cluster_labels):
            clusters[int(label)].append(text)

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
