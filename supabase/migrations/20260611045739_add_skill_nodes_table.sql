-- ============================================
-- MIGRATION: add_skill_nodes_table
-- Creates skill_nodes + user_skill_scores tables
-- ============================================

-- Skill nodes (the graph structure)
CREATE TABLE public.skill_nodes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  parent_id   UUID REFERENCES public.skill_nodes(id),
  difficulty  SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  metadata    JSONB DEFAULT '{}'
);

-- Index for category filtering
CREATE INDEX idx_skill_nodes_category ON public.skill_nodes(category);

-- User skill scores (per-user scores for each skill)
CREATE TABLE public.user_skill_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_node_id UUID NOT NULL REFERENCES public.skill_nodes(id),
  score         NUMERIC(5,2) CHECK (score BETWEEN 0 AND 100),
  confidence    NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
  attempts      SMALLINT DEFAULT 0,
  last_evaluated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill_node_id)
);

CREATE INDEX idx_user_skill_scores_user ON public.user_skill_scores(user_id);

-- RLS for user_skill_scores
ALTER TABLE public.user_skill_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own skill scores"
  ON public.user_skill_scores FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "users can update own skill scores"
  ON public.user_skill_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- SEED DATA: Initial skill nodes for SDE roles
INSERT INTO public.skill_nodes (name, category, difficulty) VALUES
  ('Dynamic Programming', 'DSA', 4),
  ('Graph Algorithms', 'DSA', 4),
  ('Arrays & Hashing', 'DSA', 1),
  ('Two Pointers', 'DSA', 2),
  ('Sliding Window', 'DSA', 3),
  ('Binary Search', 'DSA', 3),
  ('Linked Lists', 'DSA', 2),
  ('Trees', 'DSA', 3),
  ('Heaps', 'DSA', 3),
  ('Backtracking', 'DSA', 4),
  ('Buckets & Priority', 'DSA', 3),
  
  ('System Design Basics', 'System Design', 1),
  ('Caching', 'System Design', 3),
  ('Load Balancing', 'System Design', 2),
  ('Database Sharding', 'System Design', 4),
  ('API Design', 'System Design', 2),
  ('Microservices', 'System Design', 3),
  ('Scalability', 'System Design', 3),
  
  ('Communication', 'Behavioral', 1),
  ('Leadership', 'Behavioral', 2),
  ('Problem Solving', 'Behavioral', 1),
  ('Team Fit', 'Behavioral', 1);