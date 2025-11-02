# When Stuck - Unblocking Workflow

**Systematic approach to getting unstuck**

---

## Task

Help you get unstuck when blocked on a problem after trying multiple approaches.

---

## Step 1: Reset Context

**Clear stale context:**

```
/clear
```

**Why:** Fresh start removes confusing context from failed attempts

---

## Step 2: Describe the Problem

**Be specific and comprehensive:**

```
I'm stuck on [problem description].

Goal: [what you're trying to achieve]

What I've tried:
1. [attempt 1] - Result: [what happened]
2. [attempt 2] - Result: [what happened]
3. [attempt 3] - Result: [what happened]

Current error: [paste full error with stack trace]

Expected behavior: [what should happen]
Actual behavior: [what is happening]

Relevant code: [paste code around the issue]

Context: [any other relevant information]
```

**Complete template ensures Claude has full picture**

---

## Step 3: Deep Analysis

**Trigger extended reasoning:**

```
Think harder and analyze this problem from multiple angles:

1. What are the possible root causes?
2. What assumptions might be wrong?
3. What am I missing or overlooking?
4. Are there edge cases I haven't considered?
5. Is there a simpler approach I'm not seeing?

For each possibility, explain likelihood and how to verify.
```

**Why "think harder":** Triggers deeper AI reasoning for complex problems

---

## Step 4: Generate Alternative Approaches

```
Propose 3 completely different approaches to solve this:

For each approach:
- Description (how it works)
- Pros (advantages)
- Cons (disadvantages)
- Complexity (simple/moderate/complex)
- Risks (what could go wrong)
- Implementation steps (high-level)

Don't propose variations of what I've already tried.
Think outside the box.
```

**Forces fresh perspective**

---

## Step 5: Interactive Problem Solving

**Ask clarifying questions:**

```
Before proposing a solution, ask me questions to understand:
- What constraints exist?
- What are the requirements?
- What's the broader context?
- What's the end goal beyond this immediate problem?
- Are there unstated assumptions?
```

**Often the "stuck" feeling comes from unclear requirements**

---

## Step 6: Implement Solution

**Once approach selected:**

```
Let's implement approach [number] step-by-step:

1. First, [smallest possible first step]
   - Verify this works before continuing

2. Then, [next small step]
   - Test this before moving on

3. Next, [incremental progress]
   - Confirm each step works

Break it down into the smallest possible increments.
After each step, I'll verify before continuing.
```

**Small steps prevent getting stuck again**

---

## Common "Stuck" Scenarios

### Scenario 1: Can't Debug Error

**Problem:** Error message unclear or misleading

**Approach:**
```
Error: [paste full error]

1. Explain this error in plain English
2. What are the top 3 causes of this error?
3. For each cause, how do I verify if that's the issue?
4. Walk me through systematic debugging steps
```

**Then:** Follow debugging steps one by one

---

### Scenario 2: Logic Doesn't Work as Expected

**Problem:** Code runs but produces wrong output

**Approach:**
```
This function produces wrong output:
[paste function]

Input: [test input]
Expected output: [expected]
Actual output: [actual]

1. Step through the logic line by line
2. Identify where the logic diverges from expectation
3. Explain why it's doing what it's doing
4. Propose fix with explanation
```

**Then:** Add tests for the broken case before fixing

---

### Scenario 3: Performance Problem

**Problem:** Code works but too slow

**Approach:**
```
This code is too slow:
[paste code]

Current performance: [time/metrics]
Required performance: [target]

1. Profile the code - where is time spent?
2. Identify bottlenecks
3. Propose optimizations (ranked by impact)
4. Trade-offs for each optimization
5. Recommended optimization order
```

**Then:** Implement optimizations incrementally, measure each

---

### Scenario 4: Design Decision Paralysis

**Problem:** Multiple ways to solve, can't decide

**Approach:**
```
Load roles/architecture-reviewer.md

I need to decide between these approaches:
[describe options]

Constraints: [list constraints]
Requirements: [list requirements]

For each option:
1. Analyze against requirements
2. Long-term maintainability
3. Scalability considerations
4. Team skill fit
5. Clear recommendation with reasoning
```

**Then:** Pick recommended approach and implement

---

### Scenario 5: Integration Not Working

**Problem:** Two systems won't talk to each other

**Approach:**
```
Trying to integrate [system A] with [system B]:
[describe integration attempt]

Error: [paste error]

1. Verify system A works independently (how?)
2. Verify system B works independently (how?)
3. Identify integration point (where exactly?)
4. Check data formats (what's expected vs actual?)
5. Debug integration step-by-step
```

**Then:** Test each system separately first

---

### Scenario 6: Test Failing

**Problem:** Test fails, can't figure out why

**Approach:**
```
This test is failing:
[paste test code]

Error: [paste test error]

Code being tested:
[paste implementation]

1. What is the test trying to verify?
2. Is the test correct (testing right thing)?
3. Is the implementation correct?
4. What's the mismatch between test expectation and reality?
5. Should I fix test or implementation?
```

**Then:** Fix whichever is actually wrong

---

### Scenario 7: Completely Confused

**Problem:** Don't even know where to start

**Approach:**
```
I need to [goal] but I'm completely lost.

Current state: [describe current state]
Desired state: [describe goal]
Knowledge gap: [what I don't understand]

1. Break this down into smallest possible subtasks
2. Order subtasks by dependency
3. For first subtask: explain what I need to learn
4. Provide minimal example/tutorial
5. Walk me through first subtask step-by-step
```

**Then:** Focus on ONLY the first subtask, ignore the rest

---

## Debugging Checklist

When stuck, systematically verify:

### Basic Checks
- [ ] Read error message carefully (exact words matter)
- [ ] Check file paths (typos, wrong directory?)
- [ ] Verify environment (.env loaded correctly?)
- [ ] Check logs (what happened before error?)
- [ ] Verify dependencies (correct versions installed?)

### Code Checks
- [ ] Syntax correct (missing semicolons, brackets?)
- [ ] Variable names spelled correctly
- [ ] Functions called with right arguments
- [ ] Return values checked for errors
- [ ] Async operations awaited properly

### Logic Checks
- [ ] Assumptions documented and verified
- [ ] Edge cases considered
- [ ] Input validation in place
- [ ] Output verified against requirements
- [ ] State consistent throughout

### Integration Checks
- [ ] API endpoints correct
- [ ] Authentication working
- [ ] Data format matches expectation
- [ ] Network connectivity verified
- [ ] Permissions/access granted

---

## Prevention

**Avoid getting stuck:**

1. **Small steps** - Implement incrementally, test frequently
2. **Clear requirements** - Understand what you're building before starting
3. **TDD** - Write test first, defines success criteria
4. **Frequent commits** - Easy to roll back if stuck
5. **Ask early** - Don't wait hours before asking for help
6. **Document assumptions** - Write them down, verify them
7. **Read documentation** - Don't guess API behavior
8. **Use debugger** - Step through code, inspect state
9. **Rubber duck** - Explain problem out loud
10. **Take breaks** - Fresh eyes see obvious solutions

---

## When to Ask Human

**Escalate after 30 minutes if:**

- Tried multiple approaches, all failed
- Problem is blocking critical work
- Involves business logic decision
- Security implications unclear
- Affects other team members
- Deadline approaching

**How to ask:**
```
I'm stuck on [problem] after trying [approaches].

Can you help me [specific question]?

I've tried:
- [attempt 1] - [result]
- [attempt 2] - [result]

Current blocker: [specific issue]
```

---

## Quick Unblocking Prompts

### Super Quick
```
/clear

I'm stuck: [one sentence problem]
I tried: [quick list]
Help me get unstuck with a different approach.
```

### Standard
```
/clear

I'm stuck on [problem].

Tried:
1. [attempt]
2. [attempt]
3. [attempt]

Error: [error message]

Think harder and propose 3 completely different approaches.
```

### Deep Dive
```
/clear

I've been stuck for [time] on [problem].

Goal: [what I want to achieve]

Background: [context]

Attempts:
1. [detailed attempt 1]
2. [detailed attempt 2]
3. [detailed attempt 3]

Current state: [paste code/error]

Ultrathink and help me:
1. Identify what I'm missing
2. Question my assumptions
3. Propose radically different approaches
4. Guide me step-by-step through best approach
```

---

## Remember

**Being stuck is normal:**
- Happens to everyone
- Usually due to incorrect assumption
- Fresh perspective often solves immediately
- Taking break helps

**You're not alone:**
- AI can help
- Team can help
- Documentation exists
- Someone solved this before

**Learning opportunity:**
- Understand WHY you got stuck
- Update CLAUDE.md with gotcha
- Share learning with team
- Won't get stuck same way again

---

**Last Updated:** 2025-10-16