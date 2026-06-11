-- ============================================
-- MIGRATION: add_questions_table
-- ============================================

CREATE TABLE public.questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text          TEXT NOT NULL,
  category      TEXT NOT NULL,
  difficulty    SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  skill_node_id UUID REFERENCES public.skill_nodes(id),
  metadata      JSONB DEFAULT '{}'
);

CREATE INDEX idx_questions_category ON public.questions(category);

-- Seed questions
INSERT INTO public.questions (text, category, difficulty, skill_node_id) VALUES
  ('Given an array of integers, return indices of the two numbers that add up to a specific target.',
    'DSA', 2, (SELECT id FROM public.skill_nodes WHERE name = 'Arrays & Hashing')),

  ('Given a sorted array, use two pointers to find all pairs that sum to a given target.',
    'DSA', 2, (SELECT id FROM public.skill_nodes WHERE name = 'Two Pointers')),

  ('Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.',
    'DSA', 3, (SELECT id FROM public.skill_nodes WHERE name = 'Linked Lists')),

  ('Given a string, find the length of the longest substring without repeating characters.',
    'DSA', 3, (SELECT id FROM public.skill_nodes WHERE name = 'Sliding Window')),

  ('Search a target value in a rotated sorted array in O(log n) time.',
    'DSA', 3, (SELECT id FROM public.skill_nodes WHERE name = 'Binary Search')),

  ('How would you design a URL shortening service like TinyURL? Walk through your approach.',
    'System Design', 2, (SELECT id FROM public.skill_nodes WHERE name = 'API Design')),

  ('Explain the difference between horizontal and vertical scaling. When would you use each?',
    'System Design', 2, (SELECT id FROM public.skill_nodes WHERE name = 'Scalability')),

  ('How does caching work? Describe a scenario where caching could cause a serious bug.',
    'System Design', 3, (SELECT id FROM public.skill_nodes WHERE name = 'Caching')),

  ('Design a notification system that can handle 10 million users.',
    'System Design', 4, (SELECT id FROM public.skill_nodes WHERE name = 'Microservices')),

  ('Describe a challenging technical project you worked on. What was your approach and what did you learn?',
    'Behavioral', 1, (SELECT id FROM public.skill_nodes WHERE name = 'Problem Solving')),

  ('Tell me about a time you disagreed with a teammate. How did you handle it?',
    'Behavioral', 2, (SELECT id FROM public.skill_nodes WHERE name = 'Team Fit')),

  ('Give an example of when you took ownership of a problem that was not your responsibility.',
    'Behavioral', 2, (SELECT id FROM public.skill_nodes WHERE name = 'Leadership'));