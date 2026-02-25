const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const PlacementRoadmap = require('../models/PlacementRoadmap');
const LearningResource = require('../models/LearningResource');

const router = express.Router();

const normaliseDomain = (domain) => String(domain || '').trim();

async function enrichSectionsWithResources(domain, sections) {
  const norm = normaliseDomain(domain).toLowerCase();

  const resources = await LearningResource.find({
    domain: { $in: [norm, 'any', 'all'] },
  }).lean();

  if (!resources.length) return sections;

  const prepared = resources.map((r) => ({
    ...r,
    topics: (r.topics || []).map((t) => String(t).toLowerCase()),
  }));

  return (sections || []).map((section) => ({
    ...section,
    items: (section.items || []).map((item) => {
      const text = String(item.text || '');
      const lower = text.toLowerCase();

      const matches = prepared.filter((res) => {
        if (!res.topics.length) return false;
        return res.topics.some((topic) => lower.includes(topic));
      });

      const existingByUrl = {};
      (item.resources || []).forEach((r) => {
        if (r && r.url) {
          existingByUrl[r.url] = {
            label: String(r.label || 'Resource'),
            url: String(r.url),
          };
        }
      });

      matches.forEach((r) => {
        if (r.url && !existingByUrl[r.url]) {
          existingByUrl[r.url] = {
            label: String(r.label || 'Resource'),
            url: String(r.url),
          };
        }
      });

      return {
        ...item,
        text,
        resources: Object.values(existingByUrl),
      };
    }),
  }));
}

const buildFallbackRoadmap = (domain) => {
  const d = domain.toLowerCase();
  const common = [
    {
      title: 'Fundamentals to Learn',
      items: [
        {
          text: 'Strengthen CS basics: data structures, algorithms, time & space complexity',
          resources: [
            { label: 'Khan Academy - Algorithms', url: 'https://www.khanacademy.org/computing/computer-science/algorithms' },
            { label: 'NeetCode beginner DSA playlist', url: 'https://www.youtube.com/playlist?list=PLot-Xpze53ldVwtstag2TL4HQhAnC8ATf' },
          ],
        },
        {
          text: 'Understand operating systems, networks, and databases at a beginner level',
          resources: [
            { label: 'CS50 Lecture Notes', url: 'https://cs50.harvard.edu/x/2024/notes/' },
          ],
        },
        {
          text: 'Practice problem-solving on easy-level coding questions regularly',
          resources: [
            { label: 'LeetCode Explore - Top Interview Questions Easy', url: 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/' },
          ],
        },
      ],
    },
    {
      title: 'Interview-Focused Topics',
      items: [
        {
          text: 'Prepare concise answers for “Tell me about yourself” and project explanations',
          resources: [
            { label: 'Tech interview storytelling tips', url: 'https://www.youtube.com/watch?v=w7yKx4J7P5U' },
          ],
        },
        {
          text: 'Practice explaining your projects, decisions, and trade-offs clearly',
          resources: [
            { label: 'System design interview basics', url: 'https://www.youtube.com/watch?v=UzLMhqg3_Wc' },
          ],
        },
        {
          text: 'Solve common behavioral interview questions (teamwork, conflict, ownership)',
          resources: [
            { label: 'Behavioral interview prep (STAR method)', url: 'https://www.youtube.com/watch?v=76U8A9q-pk8' },
          ],
        },
      ],
    },
    {
      title: 'Best Practices & Habits',
      items: [
        {
          text: 'Maintain a clean GitHub portfolio with 2–3 polished projects',
          resources: [
            { label: 'GitHub profile & README tips', url: 'https://www.youtube.com/watch?v=ECuqb5Tv9qI' },
          ],
        },
        {
          text: 'Create a targeted resume tailored to your chosen domain',
          resources: [
            { label: 'Google Resume Guide', url: 'https://careers.google.com/how-we-hire/resume/' },
          ],
        },
        {
          text: 'Apply consistently and track companies, roles, and application status',
          resources: [
            { label: 'Simple job tracking template', url: 'https://docs.google.com/spreadsheets/' },
          ],
        },
      ],
    },
  ];

  if (d.includes('web')) {
    return [
      {
        title: 'Fundamentals to Learn',
        items: [
          {
            text: 'HTML5: semantic tags, forms, accessibility basics',
            resources: [
              { label: 'MDN HTML Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' },
              { label: 'HTML Crash Course', url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU' },
            ],
          },
          {
            text: 'CSS3: flexbox, grid, responsive design, media queries',
            resources: [
              { label: 'MDN CSS Layout', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout' },
              { label: 'Flexbox & Grid Tutorial', url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc' },
            ],
          },
          {
            text: 'JavaScript fundamentals: variables, functions, arrays, objects, DOM',
            resources: [
              { label: 'MDN JS Guide', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript' },
              { label: 'JavaScript Full Course', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
            ],
          },
        ],
      },
      {
        title: 'Core Technical Topics',
        items: [
          {
            text: 'Modern JavaScript: ES6+, promises, async/await, modules',
            resources: [
              { label: 'ES6+ Features', url: 'https://javascript.info/first-steps' },
            ],
          },
          {
            text: 'One frontend framework (React preferred): components, props, state, hooks',
            resources: [
              { label: 'React Official Docs', url: 'https://react.dev/learn' },
              { label: 'React for Beginners', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk' },
            ],
          },
          {
            text: 'HTTP basics: methods, status codes, REST APIs, JSON',
            resources: [
              { label: 'HTTP Overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
            ],
          },
        ],
      },
      {
        title: 'Important Tools & Technologies',
        items: [
          {
            text: 'Git & GitHub: branching, pull requests, basic workflows',
            resources: [
              { label: 'Git Handbook', url: 'https://guides.github.com/introduction/git-handbook/' },
              { label: 'Git & GitHub Crash Course', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' },
            ],
          },
          {
            text: 'Package managers: npm / yarn, basic scripts',
            resources: [
              { label: 'npm Docs', url: 'https://docs.npmjs.com/' },
            ],
          },
          {
            text: 'Build tools: CRA / Vite, basic bundling, environment variables',
            resources: [
              { label: 'Vite Guide', url: 'https://vitejs.dev/guide/' },
            ],
          },
        ],
      },
      {
        title: 'Interview-Focused Topics',
        items: [
          {
            text: 'Implement common UI components (modals, forms, tables) from scratch',
            resources: [
              { label: 'UI Component Patterns', url: 'https://www.youtube.com/watch?v=nx1KqjYt-9k' },
            ],
          },
          {
            text: 'Practice coding questions involving arrays, strings, and objects in JS',
            resources: [
              { label: 'LeetCode JavaScript patterns', url: 'https://leetcode.com/tag/javascript/' },
            ],
          },
          {
            text: 'Be able to explain event loop, promises, and rendering flow in React',
            resources: [
              { label: 'JS Event Loop Visualized', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ' },
            ],
          },
        ],
      },
      ...common.slice(1),
    ];
  }

  if (d.includes('data')) {
    return [
      {
        title: 'Fundamentals to Learn',
        items: [
          {
            text: 'Python basics: syntax, functions, lists, dictionaries, modules',
            resources: [
              { label: 'Python for Beginners', url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
              { label: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/' },
            ],
          },
          {
            text: 'Math basics: statistics, probability, linear algebra essentials',
            resources: [
              { label: 'Khan Academy Stats & Probability', url: 'https://www.khanacademy.org/math/statistics-probability' },
            ],
          },
          {
            text: 'SQL: SELECT, JOIN, GROUP BY, filtering, aggregations',
            resources: [
              { label: 'SQLBolt Interactive Lessons', url: 'https://sqlbolt.com/' },
            ],
          },
        ],
      },
      {
        title: 'Core Technical Topics',
        items: [
          {
            text: 'Pandas & NumPy for data cleaning and manipulation',
            resources: [
              { label: 'Pandas Docs', url: 'https://pandas.pydata.org/docs/' },
              { label: 'NumPy Docs', url: 'https://numpy.org/doc/' },
            ],
          },
          {
            text: 'Data visualization: Matplotlib / Seaborn / Plotly basics',
            resources: [
              { label: 'Data Viz in Python', url: 'https://www.youtube.com/watch?v=DAQNHzOcO5A' },
            ],
          },
          {
            text: 'Intro to machine learning: supervised vs unsupervised, common algorithms',
            resources: [
              { label: 'Hands-on ML (free chapter)', url: 'https://github.com/ageron/handson-ml2' },
            ],
          },
        ],
      },
      {
        title: 'Important Tools & Technologies',
        items: [
          {
            text: 'Jupyter Notebooks and virtual environments',
            resources: [
              { label: 'Jupyter Docs', url: 'https://docs.jupyter.org/' },
            ],
          },
          {
            text: 'Version control with Git & GitHub',
            resources: [
              { label: 'Git & GitHub Crash Course', url: 'https://www.youtube.com/watch?v=RGOj5yH7evk' },
            ],
          },
          {
            text: 'Basic cloud / deployment options for ML demos (Streamlit, Hugging Face Spaces)',
            resources: [
              { label: 'Streamlit Docs', url: 'https://docs.streamlit.io/' },
              { label: 'Hugging Face Spaces Guide', url: 'https://huggingface.co/docs/hub/spaces-overview' },
            ],
          },
        ],
      },
      {
        title: 'Interview-Focused Topics',
        items: [
          {
            text: 'Explain end-to-end data projects (problem, data, approach, evaluation)',
            resources: [
              { label: 'Data science project walkthrough', url: 'https://www.youtube.com/watch?v=XoU-tZPZH_4' },
            ],
          },
          {
            text: 'Practice questions on SQL and data manipulation',
            resources: [
              { label: 'StrataScratch SQL questions', url: 'https://www.stratascratch.com/' },
            ],
          },
          {
            text: 'Understand overfitting, cross validation, bias–variance trade-off',
            resources: [
              { label: 'Overfitting vs Underfitting', url: 'https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html' },
            ],
          },
        ],
      },
      ...common.slice(2),
    ];
  }

  if (d.includes('cloud') || d.includes('devops')) {
    return [
      {
        title: 'Fundamentals to Learn',
        items: [
          {
            text: 'Linux basics: filesystem, permissions, common commands',
            resources: [
              { label: 'Linux Journey', url: 'https://linuxjourney.com/' },
            ],
          },
          {
            text: 'Networking basics: IP, DNS, HTTP, load balancing',
            resources: [
              { label: 'Computer Networking Course', url: 'https://www.youtube.com/watch?v=qiQR5rTSshw' },
            ],
          },
          {
            text: 'Cloud fundamentals: IaaS vs PaaS vs SaaS',
            resources: [
              { label: 'AWS Cloud Practitioner Essentials', url: 'https://www.aws.training/Details/Curriculum?id=20685' },
            ],
          },
        ],
      },
      {
        title: 'Core Technical Topics',
        items: [
          {
            text: 'One cloud provider basics (AWS / Azure / GCP): compute, storage, networking',
            resources: [
              { label: 'AWS Getting Started', url: 'https://aws.amazon.com/getting-started/' },
            ],
          },
          {
            text: 'Containers: Docker basics, building and running images',
            resources: [
              { label: 'Docker for Beginners', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo' },
            ],
          },
          {
            text: 'CI/CD basics: pipelines, automated tests, deployment concepts',
            resources: [
              { label: 'CI/CD for Beginners', url: 'https://www.youtube.com/watch?v=scEDHsr3APg' },
            ],
          },
        ],
      },
      {
        title: 'Important Tools & Technologies',
        items: [
          {
            text: 'Git & GitHub workflows for collaboration',
            resources: [
              { label: 'Git Branching', url: 'https://learngitbranching.js.org/' },
            ],
          },
          {
            text: 'Infrastructure-as-Code basics (Terraform or CloudFormation overview)',
            resources: [
              { label: 'Terraform Docs', url: 'https://developer.hashicorp.com/terraform/docs' },
            ],
          },
          {
            text: 'Monitoring and logging fundamentals',
            resources: [
              { label: 'Observability Basics', url: 'https://grafana.com/oss/' },
            ],
          },
        ],
      },
      {
        title: 'Interview-Focused Topics',
        items: [
          {
            text: 'Explain how you would deploy a simple web application end to end',
            resources: [
              { label: 'Deploying a Node app (example)', url: 'https://www.youtube.com/watch?v=hn5vC0h0s8c' },
            ],
          },
          {
            text: 'Understand basic high-availability and scaling patterns',
            resources: [
              { label: 'High Availability Basics', url: 'https://www.youtube.com/watch?v=-W9F__D3oY4' },
            ],
          },
          {
            text: 'Discuss trade-offs between different deployment strategies',
            resources: [
              { label: 'Blue/Green & Canary Deployments', url: 'https://martinfowler.com/bliki/BlueGreenDeployment.html' },
            ],
          },
        ],
      },
      ...common.slice(2),
    ];
  }

  // Generic roadmap if domain is unknown
  return common;
};

async function generateRoadmapWithAI(domain) {
  const groqApiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  let groqApiUrl =
    process.env.GROQ_API_URL || process.env.GROK_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  groqApiUrl = groqApiUrl.trim().replace(/\.$/, '');
  const groqModel = process.env.GROQ_MODEL || process.env.GROK_MODEL || 'llama-3.3-70b-versatile';

  if (!groqApiKey) {
    // Fallback to deterministic roadmap if no key configured
    return buildFallbackRoadmap(domain);
  }

  const prompt = `You are an expert career mentor.
Generate a beginner-friendly roadmap to land an entry-level job in the domain: "${domain}".

Return STRICTLY valid JSON in this exact format, nothing else:
{
  "sections": [
    {
      "title": "Section title",
      "items": [
        {
          "text": "Checklist item 1 (short, actionable)",
          "resources": [
            { "label": "Resource Name", "url": "https://..." }
          ]
        },
        {
          "text": "Checklist item 2",
          "resources": [
            { "label": "Another Resource", "url": "https://..." }
          ]
        }
      ]
    }
  ]
}

Sections must cover:
- Fundamentals to learn
- Core technical topics
- Important tools & technologies
- Interview-focused topics
- Best practices and recommended learning order.

Keep items short, actionable, and suitable for a student.`;

  const requestBody = {
    model: groqModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
    stream: false,
  };

  const response = await axios.post(groqApiUrl, requestBody, {
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 60000,
  });

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    return buildFallbackRoadmap(domain);
  }

  try {
    const match = content.match(/\{[\s\S]*\}/);
    const json = JSON.parse(match ? match[0] : content);
    if (!json.sections || !Array.isArray(json.sections)) {
      return buildFallbackRoadmap(domain);
    }
    return json.sections.map((section) => ({
      title: String(section.title || 'Untitled Section'),
      items: (section.items || []).map((raw) => {
        if (typeof raw === 'string') {
          return { text: raw, completed: false, resources: [] };
        }
        const text = String(raw.text || '');
        const resources = Array.isArray(raw.resources)
          ? raw.resources
              .map((r) => ({
                label: String(r.label || 'Resource'),
                url: String(r.url || ''),
              }))
              .filter((r) => r.url)
          : [];
        return { text, completed: false, resources };
      }),
    }));
  } catch (err) {
    console.error('AI roadmap parse error:', err.message);
    return buildFallbackRoadmap(domain);
  }
}

// POST /api/placementprep/ai-roadmap
router.post('/ai-roadmap', auth, async (req, res) => {
  try {
    const { domain, regenerate } = req.body || {};
    const normDomain = normaliseDomain(domain);
    if (!normDomain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    let roadmap = await PlacementRoadmap.findOne({ user: req.user.id, domain: normDomain });

    if (roadmap && !regenerate) {
      return res.json({
        domain: roadmap.domain,
        sections: roadmap.sections,
      });
    }

    let sections = await generateRoadmapWithAI(normDomain);
    sections = await enrichSectionsWithResources(normDomain, sections);

    if (roadmap) {
      roadmap.sections = sections;
      await roadmap.save();
    } else {
      roadmap = await PlacementRoadmap.create({
        user: req.user.id,
        domain: normDomain,
        sections,
      });
    }

    return res.status(201).json({
      domain: roadmap.domain,
      sections: roadmap.sections,
    });
  } catch (err) {
    console.error('AI Roadmap generation error:', err);
    return res.status(500).json({
      message: 'Failed to generate roadmap',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

// GET /api/placementprep/ai-roadmap
router.get('/ai-roadmap', auth, async (req, res) => {
  try {
    const roadmap = await PlacementRoadmap.findOne({ user: req.user.id }).sort({ updatedAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap found' });
    }
    return res.json({
      domain: roadmap.domain,
      sections: roadmap.sections,
    });
  } catch (err) {
    console.error('AI Roadmap fetch error:', err);
    return res.status(500).json({
      message: 'Failed to fetch roadmap',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

// PATCH /api/placementprep/ai-roadmap - update checklist progress
router.patch('/ai-roadmap', auth, async (req, res) => {
  try {
    const { domain, sections } = req.body || {};
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ message: 'sections array is required' });
    }

    const query = { user: req.user.id };
    if (domain) {
      query.domain = normaliseDomain(domain);
    }

    const roadmap = await PlacementRoadmap.findOne(query);
    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap found to update' });
    }

    // Only update completion state & text; avoid accidental field injection
    roadmap.sections = sections.map((section) => ({
      title: String(section.title || 'Untitled Section'),
      items: (section.items || []).map((item) => ({
        text: String(item.text || ''),
        completed: Boolean(item.completed),
        resources: Array.isArray(item.resources)
          ? item.resources
              .map((r) => ({
                label: String(r.label || 'Resource'),
                url: String(r.url || ''),
              }))
              .filter((r) => r.url)
          : [],
      })),
    }));

    await roadmap.save();

    return res.json({
      message: 'Roadmap progress updated',
      domain: roadmap.domain,
      sections: roadmap.sections,
    });
  } catch (err) {
    console.error('AI Roadmap update error:', err);
    return res.status(500).json({
      message: 'Failed to update roadmap',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

module.exports = router;

