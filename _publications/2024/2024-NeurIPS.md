---
title:          "Visual Fourier Prompt Tuning"
date:           2024-09-25 12:01:00 +0800
selected:       true
pub:            "Conference on Neural Information Processing Systems (NeurIPS)"
# pub_pre:        "Submitted to "
# pub_post:       'Under review.'
pub_last:       ' <span class="badge badge-pill badge-publication badge-success">Spotlight</span>'
pub_date:       "2024"

abstract: >-
  With the scale of Transformer-based vision models continuing to grow, finetuning these large-scale pretrained models for new tasks has become increasingly parameter-intensive. Visual prompt tuning is introduced as a parameter-efficient finetuning (PEFT) method to this trend. Despite its successes, a notable research challenge persists within almost all PEFT approaches: significant performance degradation is observed when there is a substantial disparity between the datasets used in pretraining and finetuning phases. To address this challenge, we draw inspiration from human visual cognition, and propose the Visual Fourier Prompt Tuning (VFPT) method as an effective and efficient solution for adapting large-scale Transformer-based models. Our approach innovatively incorporates the Fast Fourier Transform into prompt embeddings, seamlessly integrating both spatial and frequency domain information. Apart from its inherent simplicity and intuitiveness, VFPT exhibits superior performance across various tasks, offering a general solution to address the data disparity challenge. Empirical results demonstrate that our approach outperforms several state-of-the-art baselines on two benchmarks, with low parameter usage (e.g., 0.57% of model parameters on VTAB-1k) and notable performance enhancements (e.g., 73.20% of mean accuracy on VTAB-1k).
cover:          assets\images\paper\vfpt.jpg
authors:
  - Runjia Zeng
  - Cheng Han
  - Qifan Wang
  - Chunshu Wu
  - Tong Geng
  - Lifu Huang
  - Ying Nian Wu
  - Dongfang Liu
links:
  Code: https://github.com/runtsang/VFPT
  Paper: https://nips.cc/virtual/2024/poster/93669
---
