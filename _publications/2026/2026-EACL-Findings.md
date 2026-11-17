---
title:          "The Generative Crossroads: Diffusion or Autoregression for Language Modeling?"
date:           2026-11-02 12:01:00 -0500
selected:       true
publication_groups: [others]
pub:            "Findings of the European Chapter of the Association for Computational Linguistics"
pub_last:       ' <span class="badge badge-pill badge-publication badge-success">EACL Findings</span>'
pub_date:       "2027"
interests:      ["LLMs", "GenAI", "Reasoning"]
note:           "Diffusion LLMs"

abstract: >-
  We revisit LLM reasoning through two decoding paradigms, namely autoregressive large language models (AR LLMs) with next-token prediction, and diffusion-based large language models (DLLMs) with iterative denoising. Despite the growing interest in DLLMs, when each paradigm is preferable and how to elicit DLLM strengths remains unclear. We recast reasoning as trajectory formation, contrasting sequential commitment in AR LLMs with iterative refinement in DLLMs, and run a matched-scale study across mathematics, logic, natural-language inference, and commonsense reasoning. Empirically, DLLMs outperform AR LLMs on most reasoning benchmarks, especially those requiring global constraints and long-range coherence, whereas AR LLMs remain competitive on shorter, commonsense-oriented tasks. Further analyses show that DLLMs gradually correct early errors and enforce sequence-wide consistency, and robustness experiments reveal graceful degradation under prompt noise. The quantification of the accuracy and efficiency trade-off shows that DLLMs increase FLOPs and latency, yet compute matched comparisons preserve their advantage. Our results delineate regimes where diffusion decoding is advantageous and provide deployment guidance.
cover:          assets/images/paper/llm_diff.jpg
institutions:   [purdue, umkc, rit, gyges, meta]
authors:
  - Xiang Zhang
  - Yiyang Liu
  - Runjia Zeng
  - Xueling Zhang
  - Siyuan Qi
  - Qifan Wang
  - Dongfang Liu
  - Cheng Han
---
