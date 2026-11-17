---
title:          "Two Actions from One State: Fork Futures Teach JEPA World Models to Compare"
date:           2026-11-03 12:01:00 -0500
selected:       true
publication_groups: [others]
pub:            ""
pub_last:       ' <span class="badge badge-pill badge-publication badge-secondary">arXiv</span>'
pub_date:       "2026"
interests:      ["RL"]
note:           "World Models"

abstract: >-
  JEPA world models are trained to predict logged transitions but used to compare counterfactual actions from one state. The logged behavior data show one action per state, and under a local linear approximation we prove the action response is unidentified along any direction the policy never varies within a state. We therefore supplement behavior data with measured outcomes of alternative actions from the same state. Our fork futures execute two actions from one restored state, and their outcome difference cancels the state term, identifying the action response on the sampled span. The resulting model, Fork-JEPA, matches predicted to measured differences, anchors the logged successor with behavior prediction, and adds a lookback head that keeps the predecessor recoverable, all at training time, leaving planning unchanged. On three visual control tasks, behavior-only training leaves the predicted action effect no better than a constant guess. Fork-JEPA makes it readable and raises planning success by up to 14% over LeWM, its base model. Where the action response changes across hidden zones, it nearly doubles cross-zone success, and 1,024 fork pairs beat 1.2M extra behavior steps.
cover:          assets/images/paper/fork.jpg
institutions:   [purdue, rit, meta, unt]
authors:
  - Yihao Wu
  - Runjia Zeng
  - Tongyan Wang
  - Renzhong Huang
  - Chongzhou Fang
  - Qifan Wang
  - Heng Fan
  - Dongfang Liu
---
