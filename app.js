const samplePrompts = [
  "Plan a 5-day Tokyo trip with a budget tracker, itinerary, and packing list.",
  "Create a launch dashboard for a new product with tasks, risks, and key milestones.",
  "Help me compare laptops for design work with specs, prices, and a decision score.",
  "Build a study planner for a machine learning interview over the next 3 weeks.",
  "I need a client meeting prep space with agenda, notes, and follow-up actions."
];

const initialAssistantMessage =
  "Tell me the outcome you want, and I’ll generate a custom workspace for it. I can reshape the UI for planning, tracking, comparing, preparing, and more.";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const chatThread = document.querySelector("#chatThread");
const assistantStatus = document.querySelector("#assistantStatus");
const workspaceType = document.querySelector("#workspaceType");
const uiBrief = document.querySelector("#uiBrief");
const uiCanvas = document.querySelector("#uiCanvas");
const promptChips = document.querySelector("#promptChips");
const messageTemplate = document.querySelector("#messageTemplate");

const intentLibrary = [
  {
    id: "travel-planner",
    matchers: ["trip", "travel", "vacation", "itinerary", "packing", "flight", "hotel"],
    label: "Travel Planner",
    summary:
      "A planning cockpit for dates, budget, itinerary blocks, and checklist-heavy travel logistics.",
    goals: [
      "Capture destination, timing, and spending boundaries quickly.",
      "Turn a vague trip idea into concrete daily plans.",
      "Keep logistics, reservations, and packing in one view."
    ],
    cards: [
      {
        title: "Trip Snapshot",
        meta: "Core inputs",
        span: "wide",
        type: "form",
        fields: [
          { label: "Destination", type: "text", placeholder: "Tokyo, Japan" },
          { label: "Travel Dates", type: "text", placeholder: "May 12 - May 17" },
          { label: "Budget", type: "text", placeholder: "$2,500 total" },
          { label: "Travel Style", type: "select", options: ["Balanced", "Luxury", "Budget", "Fast-paced"] }
        ]
      },
      {
        title: "Daily Itinerary",
        meta: "Suggested structure",
        type: "timeline",
        items: [
          ["Day 1", "Arrival, hotel check-in, neighborhood walk, dinner shortlist"],
          ["Day 2", "Anchor experience, lunch zone, flexible evening block"],
          ["Day 3", "Secondary district, shopping, backup rainy-day options"]
        ]
      },
      {
        title: "Packing Checklist",
        meta: "Generated essentials",
        type: "checklist",
        items: ["Passport and IDs", "Adapters and chargers", "Weather-specific layers", "Medications", "Offline maps"]
      },
      {
        title: "Budget Signals",
        meta: "Quick view",
        type: "metrics",
        metrics: [
          ["Transit", "24%", "of budget"],
          ["Stay", "42%", "largest category"],
          ["Buffer", "18%", "recommended"]
        ]
      }
    ]
  },
  {
    id: "project-dashboard",
    matchers: ["launch", "project", "roadmap", "milestone", "team", "dashboard", "build"],
    label: "Project Dashboard",
    summary:
      "A delivery-oriented workspace with milestones, task capture, risk visibility, and status tracking.",
    goals: [
      "Turn the project into clear phases and visible owners.",
      "Separate key milestones from everyday tasks.",
      "Surface blockers before they slow execution."
    ],
    cards: [
      {
        title: "Project Frame",
        meta: "Intent and constraints",
        span: "wide",
        type: "form",
        fields: [
          { label: "Project Name", type: "text", placeholder: "Spring Launch" },
          { label: "Success Metric", type: "text", placeholder: "1,000 signups in week one" },
          { label: "Launch Date", type: "text", placeholder: "June 14" },
          { label: "Status", type: "select", options: ["Planning", "In flight", "At risk", "Ready"] }
        ]
      },
      {
        title: "Milestones",
        meta: "Sequenced work",
        type: "timeline",
        items: [
          ["Week 1", "Scope lock, owners assigned, success metrics agreed"],
          ["Week 2", "Assets ready, QA checklist frozen, support docs drafted"],
          ["Week 3", "Dry run, launch review, go-live preparation"]
        ]
      },
      {
        title: "Risks",
        meta: "Watch closely",
        type: "summary",
        items: [
          ["Dependency risk", "External approvals could delay the timeline."],
          ["Messaging risk", "Core value proposition is still too broad."],
          ["QA risk", "Edge-case coverage needs a final pass."]
        ]
      },
      {
        title: "Momentum",
        meta: "Signals",
        type: "metrics",
        metrics: [
          ["Tasks done", "18", "this week"],
          ["Open risks", "3", "need owners"],
          ["Confidence", "74%", "launch readiness"]
        ]
      }
    ]
  },
  {
    id: "comparison-lab",
    matchers: ["compare", "comparison", "versus", "vs", "choose", "buy", "shopping", "laptop"],
    label: "Comparison Lab",
    summary:
      "A decision-making interface for comparing options, weighting criteria, and narrowing choices fast.",
    goals: [
      "List the options and the dimensions that matter most.",
      "Reduce emotional decision-making with explicit tradeoffs.",
      "Create a shortlist with reasons, not just scores."
    ],
    cards: [
      {
        title: "Decision Brief",
        meta: "What matters",
        span: "wide",
        type: "form",
        fields: [
          { label: "Decision", type: "text", placeholder: "Which laptop should I buy?" },
          { label: "Budget Range", type: "text", placeholder: "$1,200 - $2,000" },
          { label: "Primary Use", type: "text", placeholder: "Design work, Figma, light video editing" },
          { label: "Priority Lens", type: "select", options: ["Performance", "Value", "Portability", "Battery"] }
        ]
      },
      {
        title: "Option Scoreboard",
        meta: "Weighted comparison",
        type: "summary",
        items: [
          ["Option A", "Strong overall balance with fewer compromises."],
          ["Option B", "Highest performance but weaker battery story."],
          ["Option C", "Best value if price sensitivity matters most."]
        ]
      },
      {
        title: "Criteria",
        meta: "Suggested dimensions",
        type: "checklist",
        items: ["Performance", "Display quality", "Battery life", "Port selection", "Weight", "Price confidence"]
      },
      {
        title: "Recommendation Pulse",
        meta: "Current lean",
        type: "metrics",
        metrics: [
          ["Top fit", "Option A", "best blended score"],
          ["Budget fit", "Option C", "lowest risk spend"],
          ["Stretch pick", "Option B", "premium upside"]
        ]
      }
    ]
  },
  {
    id: "study-coach",
    matchers: ["study", "learn", "exam", "interview", "practice", "curriculum", "course"],
    label: "Study Coach",
    summary:
      "A learning workspace with milestones, practice loops, and a plan broken into manageable sessions.",
    goals: [
      "Translate a large learning goal into a finite plan.",
      "Mix theory, drills, and review loops.",
      "Keep pressure low while making progress visible."
    ],
    cards: [
      {
        title: "Learning Plan",
        meta: "Goal and timeline",
        span: "wide",
        type: "form",
        fields: [
          { label: "Target", type: "text", placeholder: "Machine learning interview" },
          { label: "Time Window", type: "text", placeholder: "3 weeks" },
          { label: "Weekly Hours", type: "text", placeholder: "8 hours" },
          { label: "Depth", type: "select", options: ["Overview", "Balanced", "Deep mastery"] }
        ]
      },
      {
        title: "Week-by-Week",
        meta: "Pacing",
        type: "timeline",
        items: [
          ["Week 1", "Foundations, concept map, and baseline practice questions"],
          ["Week 2", "Focused topic sprints with flash review at the end of each block"],
          ["Week 3", "Mock interview loops, weak-spot revision, confidence building"]
        ]
      },
      {
        title: "Practice Stack",
        meta: "What to include",
        type: "checklist",
        items: ["Core concepts", "Worked examples", "Timed drills", "Verbal explanation practice", "Reflection notes"]
      },
      {
        title: "Readiness",
        meta: "Signals",
        type: "metrics",
        metrics: [
          ["Coverage", "68%", "topics mapped"],
          ["Retention", "4.2/5", "self-score"],
          ["Confidence", "Rising", "keep rehearsal consistent"]
        ]
      }
    ]
  },
  {
    id: "meeting-prep",
    matchers: ["meeting", "client", "agenda", "notes", "prep", "follow-up"],
    label: "Meeting Prep",
    summary:
      "A focused prep interface for shaping the conversation, clarifying goals, and capturing follow-through.",
    goals: [
      "Enter the meeting knowing the outcome you want.",
      "Organize agenda, evidence, and open questions.",
      "Leave with immediate follow-up actions."
    ],
    cards: [
      {
        title: "Conversation Setup",
        meta: "Context",
        span: "wide",
        type: "form",
        fields: [
          { label: "Meeting Name", type: "text", placeholder: "Acme kickoff" },
          { label: "Objective", type: "text", placeholder: "Align on scope and next steps" },
          { label: "Participants", type: "text", placeholder: "Client lead, PM, design" },
          { label: "Tone", type: "select", options: ["Concise", "Consultative", "Strategic", "Collaborative"] }
        ]
      },
      {
        title: "Agenda",
        meta: "Flow",
        type: "timeline",
        items: [
          ["Opening", "Context, goals, and any new constraints"],
          ["Middle", "Discussion topics, questions, and points to validate"],
          ["Close", "Decisions, owners, deadlines, and recap"]
        ]
      },
      {
        title: "Must Cover",
        meta: "Non-negotiables",
        type: "checklist",
        items: ["Desired outcome", "Known risks", "Decision points", "Supporting evidence", "Follow-up owner"]
      },
      {
        title: "Post-Meeting Actions",
        meta: "Capture immediately",
        type: "summary",
        items: [
          ["Owner map", "Who owns each next action after the call."],
          ["Decision log", "What was approved, rejected, or deferred."],
          ["Follow-up note", "The summary to send within the hour."]
        ]
      }
    ]
  }
];

renderPromptChips();
appendMessage("assistant", initialAssistantMessage);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const prompt = taskInput.value.trim();
  if (!prompt) {
    taskInput.focus();
    return;
  }

  appendMessage("user", prompt);
  assistantStatus.textContent = "Generating";

  const spec = generateUiSpec(prompt);
  renderGeneratedWorkspace(spec);
  appendMessage("assistant", buildAssistantReply(spec));
  assistantStatus.textContent = "Ready";
  taskInput.value = "";
});

function renderPromptChips() {
  samplePrompts.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "prompt-chip";
    button.textContent = prompt;
    button.addEventListener("click", () => {
      taskInput.value = prompt;
      taskInput.focus();
    });
    promptChips.appendChild(button);
  });
}

function appendMessage(role, text) {
  const fragment = messageTemplate.content.cloneNode(true);
  const article = fragment.querySelector(".message");
  const roleNode = fragment.querySelector(".message-role");
  const textNode = fragment.querySelector(".message-text");

  article.classList.add(role);
  roleNode.textContent = role === "assistant" ? "UI Concierge" : "You";
  textNode.textContent = text;

  chatThread.appendChild(fragment);
  chatThread.scrollTop = chatThread.scrollHeight;
}

function generateUiSpec(prompt) {
  const lowercasePrompt = prompt.toLowerCase();

  const bestMatch =
    intentLibrary
      .map((intent) => ({
        intent,
        score: intent.matchers.reduce(
          (total, matcher) => total + (lowercasePrompt.includes(matcher) ? 1 : 0),
          0
        )
      }))
      .sort((a, b) => b.score - a.score)[0] || null;

  const baseIntent =
    bestMatch && bestMatch.score > 0 ? structuredClone(bestMatch.intent) : buildGenericIntent(prompt);

  baseIntent.userPrompt = prompt;
  baseIntent.customTitle = inferTitle(prompt, baseIntent.label);
  return baseIntent;
}

function buildGenericIntent(prompt) {
  return {
    id: "general-workspace",
    label: "General Workspace",
    summary:
      "A flexible workspace that captures the task, the important variables, the action plan, and the next moves.",
    goals: [
      "Clarify the job to be done.",
      "Expose the key inputs and constraints.",
      "Create a compact execution plan that can evolve."
    ],
    cards: [
      {
        title: "Task Framing",
        meta: "Generated from your brief",
        span: "wide",
        type: "form",
        fields: [
          { label: "Outcome", type: "text", placeholder: prompt },
          { label: "Deadline", type: "text", placeholder: "When does this need to happen?" },
          { label: "Constraints", type: "text", placeholder: "Budget, tools, people, or limits" },
          { label: "Approach", type: "select", options: ["Fast draft", "Balanced", "Detailed", "Exploratory"] }
        ]
      },
      {
        title: "Key Components",
        meta: "The assistant thinks these matter",
        type: "checklist",
        items: deriveChecklist(prompt)
      },
      {
        title: "Suggested Flow",
        meta: "First pass",
        type: "timeline",
        items: [
          ["Step 1", "Clarify the desired result and non-negotiables."],
          ["Step 2", "Gather the details and fill in missing inputs."],
          ["Step 3", "Execute, review, and adapt the workspace as needed."]
        ]
      },
      {
        title: "Execution Notes",
        meta: "What this UI is optimizing for",
        type: "summary",
        items: [
          ["Focus", "Keep the most important controls visible first."],
          ["Flexibility", "Let the interface change as the task becomes clearer."],
          ["Momentum", "Bias toward taking the next useful action quickly."]
        ]
      }
    ]
  };
}

function inferTitle(prompt, fallback) {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 54) {
    return cleaned;
  }

  const firstClause = cleaned.split(/[,.!?]/)[0];
  return firstClause.length > 14 ? firstClause : fallback;
}

function deriveChecklist(prompt) {
  const words = [...new Set(prompt.toLowerCase().match(/[a-z]{4,}/g) || [])].slice(0, 5);
  const mapped = words.map((word) => `Define how "${word}" affects the task`);

  return mapped.length
    ? mapped
    : ["Goals", "Inputs", "Dependencies", "Risks", "Next action"];
}

function buildAssistantReply(spec) {
  return `I generated a ${spec.label.toLowerCase()} for "${spec.customTitle}". If you want, you can refine it with another prompt like "make this more detailed" or "optimize this for collaboration and deadlines."`;
}

function renderGeneratedWorkspace(spec) {
  workspaceType.textContent = spec.label;

  uiBrief.innerHTML = `
    <p class="mini-label">Generated from your brief</p>
    <h3 class="brief-title">${escapeHtml(spec.customTitle)}</h3>
    <p class="brief-copy">${escapeHtml(spec.summary)}</p>
    <ul class="brief-list">
      ${spec.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}
    </ul>
  `;

  const grid = document.createElement("div");
  grid.className = "generated-grid";

  spec.cards.forEach((card) => {
    const cardElement = document.createElement("article");
    cardElement.className = `ui-card ${card.span || ""}`.trim();

    const heading = document.createElement("h3");
    heading.textContent = card.title;
    cardElement.appendChild(heading);

    const meta = document.createElement("p");
    meta.className = "card-meta";
    meta.textContent = card.meta;
    cardElement.appendChild(meta);

    if (card.type === "form") {
      cardElement.appendChild(renderFormCard(card.fields));
      cardElement.appendChild(renderActionRow());
    }

    if (card.type === "checklist") {
      const list = document.createElement("div");
      list.className = "check-list";
      card.items.forEach((item) => {
        const row = document.createElement("label");
        row.className = "check-item";
        row.innerHTML = `<input type="checkbox" /> <span>${escapeHtml(item)}</span>`;
        list.appendChild(row);
      });
      cardElement.appendChild(list);
    }

    if (card.type === "timeline") {
      const timeline = document.createElement("div");
      timeline.className = "timeline";
      card.items.forEach(([label, copy]) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.innerHTML = `<strong>${escapeHtml(label)}</strong><span>${escapeHtml(copy)}</span>`;
        timeline.appendChild(item);
      });
      cardElement.appendChild(timeline);
    }

    if (card.type === "summary") {
      const stack = document.createElement("div");
      stack.className = "summary-stack";
      card.items.forEach(([label, copy]) => {
        const item = document.createElement("div");
        item.className = "summary-item";
        item.innerHTML = `<strong>${escapeHtml(label)}</strong><p>${escapeHtml(copy)}</p>`;
        stack.appendChild(item);
      });
      cardElement.appendChild(stack);
    }

    if (card.type === "metrics") {
      const metrics = document.createElement("div");
      metrics.className = "metrics-grid";
      card.metrics.forEach(([label, value, note]) => {
        const item = document.createElement("div");
        item.className = "metric-card";
        item.innerHTML = `<span class="mini-label">${escapeHtml(label)}</span><strong>${escapeHtml(
          value
        )}</strong><p>${escapeHtml(note)}</p>`;
        metrics.appendChild(item);
      });
      cardElement.appendChild(metrics);
    }

    grid.appendChild(cardElement);
  });

  uiCanvas.innerHTML = "";
  uiCanvas.appendChild(grid);
}

function renderFormCard(fields) {
  const fieldGrid = document.createElement("div");
  fieldGrid.className = `field-grid ${fields.length === 1 ? "single" : ""}`.trim();

  fields.forEach((field) => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";

    const label = document.createElement("span");
    label.className = "field-label";
    label.textContent = field.label;
    wrapper.appendChild(label);

    if (field.type === "select") {
      const select = document.createElement("select");
      field.options.forEach((option) => {
        const optionNode = document.createElement("option");
        optionNode.textContent = option;
        optionNode.value = option;
        select.appendChild(optionNode);
      });
      wrapper.appendChild(select);
    } else {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = field.placeholder || "";
      wrapper.appendChild(input);
    }

    fieldGrid.appendChild(wrapper);
  });

  return fieldGrid;
}

function renderActionRow() {
  const row = document.createElement("div");
  row.className = "action-row";
  row.innerHTML = `
    <button type="button" class="ghost-button">Refine Layout</button>
    <button type="button" class="ghost-button">Add More Sections</button>
    <button type="button" class="ghost-button">Share Brief</button>
  `;
  return row;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
