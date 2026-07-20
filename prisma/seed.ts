import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const staticCourses = [
  {
    slug: "aptitude-engine",
    title: "Aptitude Engine Masterclass",
    subtitle: "Ace numerical, verbal and logical reasoning tests",
    category: "Numerical Reasoning",
    instructor: "Dr. Sarah Bello",
    cover: "from-navy to-navy-700",
    price: 30000,
    description:
      "A complete, exam-focused walkthrough of the reasoning tests employers use to shortlist candidates. Learn the underlying patterns, practise under timed conditions, and walk into your assessment with a repeatable method.",
    modules: [
      {
        id: "m1",
        title: "Foundations",
        lessons: [
          {
            id: "l1",
            title: "How aptitude tests really work",
            type: "video",
            duration: 8,
            content: [
              "Aptitude tests aren't measuring what you know — they measure how quickly and accurately you can apply a small set of reasoning patterns under time pressure.",
              "In this lesson we break down the four families of questions you'll meet, and why speed without a method is the single biggest reason candidates underperform.",
            ],
          },
          {
            id: "l2",
            title: "Building your timing strategy",
            type: "reading",
            duration: 6,
            content: [
              "The average candidate spends too long on the first third of a test and runs out of time before the easier questions at the end.",
              "Your goal is a consistent per-question budget. For a 20-question, 20-minute test that's roughly 55 seconds each — but you should bank time on the questions you find easy so you can spend it where it counts.",
              "Practise flagging and skipping. A skipped question you return to is worth far more than a rushed guess that breaks your rhythm.",
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "Numerical Reasoning",
        lessons: [
          {
            id: "l3",
            title: "Ratios, percentages & rates",
            type: "video",
            duration: 12,
            content: [
              "Most numerical questions reduce to three operations: comparing ratios, applying percentage change, and converting rates. Master these and you cover the majority of the paper.",
              "We work through worked examples for each, then look at the traps — reversed percentage changes, and units that quietly switch between rows of a table.",
            ],
          },
          {
            id: "l4",
            title: "Reading data tables under pressure",
            type: "reading",
            duration: 7,
            content: [
              "Read the question before the table. You only need a fraction of the data on screen, and scanning the whole table first wastes your budget.",
              "Underline the exact figure asked for, note the units, then locate just those cells. Speed here comes from ignoring everything irrelevant.",
            ],
          },
          {
            id: "l5",
            title: "Numerical practice set",
            type: "quiz",
            duration: 10,
            content: [
              "A short set of numerical questions that mirror real test conditions. Work through each one, then submit to see your score and worked explanations.",
              "Aim for 60% or higher to mark this lesson complete — and retake it as many times as you like.",
            ],
            questions: [
              {
                id: "q1",
                prompt: "A jacket costs $80. In a sale it is reduced by 25%. What is the sale price?",
                options: [
                  { id: "a", text: "$55" },
                  { id: "b", text: "$60" },
                  { id: "c", text: "$65" },
                  { id: "d", text: "$20" },
                ],
                correctId: "b",
                explanation: "25% of $80 is $20, so the sale price is $80 − $20 = $60.",
              },
              {
                id: "q2",
                prompt: "A team of 4 people completes a task in 6 hours. At the same rate, how long would 3 people take?",
                options: [
                  { id: "a", text: "4.5 hours" },
                  { id: "b", text: "6 hours" },
                  { id: "c", text: "7.5 hours" },
                  { id: "d", text: "8 hours" },
                ],
                correctId: "d",
                explanation: "The task is 4 × 6 = 24 person-hours. Split across 3 people: 24 ÷ 3 = 8 hours.",
              },
              {
                id: "q3",
                prompt: "Sales grew from 200 units to 250 units. What is the percentage increase?",
                options: [
                  { id: "a", text: "15%" },
                  { id: "b", text: "20%" },
                  { id: "c", text: "25%" },
                  { id: "d", text: "50%" },
                ],
                correctId: "c",
                explanation: "Increase is 50 units on a base of 200: 50 ÷ 200 = 0.25 = 25%.",
              },
              {
                id: "q4",
                prompt: "On a map with scale 1:50,000, two towns are 4 cm apart. What is the real distance?",
                options: [
                  { id: "a", text: "0.2 km" },
                  { id: "b", text: "2 km" },
                  { id: "c", text: "20 km" },
                  { id: "d", text: "200 km" },
                ],
                correctId: "b",
                explanation: "4 cm × 50,000 = 200,000 cm = 2,000 m = 2 km.",
              },
              {
                id: "q5",
                prompt: "If 3 pens cost $4.50, how much do 7 pens cost?",
                options: [
                  { id: "a", text: "$8.00" },
                  { id: "b", text: "$9.50" },
                  { id: "c", text: "$10.50" },
                  { id: "d", text: "$12.00" },
                ],
                correctId: "c",
                explanation: "One pen costs $4.50 ÷ 3 = $1.50. Seven pens cost $1.50 × 7 = $10.50.",
              },
            ],
          },
        ],
      },
      {
        id: "m3",
        title: "Verbal & Logical Reasoning",
        lessons: [
          {
            id: "l6",
            title: "True, False or Cannot Say",
            type: "video",
            duration: 9,
            content: [
              "Verbal reasoning lives or dies on one discipline: answering only from the passage, never from what you already know.",
              "We look at how 'Cannot Say' is engineered to catch people out, and a checklist for classifying any statement in under a minute.",
            ],
          },
          {
            id: "l7",
            title: "Spotting the logical pattern",
            type: "reading",
            duration: 6,
            content: [
              "Logical reasoning sequences reward you for finding one rule, not many. Look for a single transformation applied repeatedly: rotation, addition, or alternation.",
              "When two rules seem to compete, one is usually a distractor. Test the simplest hypothesis first.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "interview-formula",
    title: "The Interview Formula",
    subtitle: "Framework-driven answers to the toughest behavioural & competency questions",
    category: "Interview Prep",
    instructor: "Michael Okonkwo",
    cover: "from-orange to-amber-500",
    price: 25000,
    description:
      "A structured system for competency and strengths-based interviews. Learn to answer any behavioural question with a story that lands, and to read what the interviewer is really assessing.",
    modules: [
      {
        id: "m1",
        title: "Before the interview",
        lessons: [
          {
            id: "l1",
            title: "Decoding the job description",
            type: "reading",
            duration: 5,
            content: [
              "Every interview question maps back to a competency in the job description. Extract the top five and you can predict most of what you'll be asked.",
              "Build one strong story per competency — you'll reuse and reshape them on the day.",
            ],
          },
          {
            id: "l2",
            title: "The STAR-L method",
            type: "video",
            duration: 11,
            content: [
              "STAR — Situation, Task, Action, Result — is the backbone, but the 'L' (Learning) is what separates good answers from memorable ones.",
              "We rebuild a weak answer into a strong one live, so you can hear the difference structure makes.",
            ],
          },
        ],
      },
      {
        id: "m2",
        title: "On the day",
        lessons: [
          {
            id: "l3",
            title: "Handling questions you can't answer",
            type: "video",
            duration: 8,
            content: [
              "You will be asked something you're not ready for. The skill isn't having an answer — it's staying composed and reasoning out loud.",
              "We cover three recovery moves that keep you credible when your mind goes blank.",
            ],
          },
          {
            id: "l4",
            title: "Questions to ask them",
            type: "reading",
            duration: 4,
            content: [
              "The questions you ask are part of your assessment. Generic questions signal generic interest.",
              "Prepare two questions that could only come from someone who researched the role, and one about the team's current challenges.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "personality-profiler",
    title: "Personality Profiler",
    subtitle: "Decode psychometric tests and present your authentic best",
    category: "Psychometrics",
    instructor: "Amara Osei",
    cover: "from-emerald-600 to-teal-500",
    price: 0,
    description:
      "Personality questionnaires aren't pass/fail, but they do shape hiring decisions. Learn what employers infer, how to answer authentically, and how to present your natural strengths.",
    modules: [
      {
        id: "m1",
        title: "The basics",
        lessons: [
          {
            id: "l1",
            title: "What personality tests measure",
            type: "video",
            duration: 7,
            content: [
              "Most workplace questionnaires map to a handful of traits — how you work with others, handle pressure, and approach detail.",
              "There are no right answers, but there are consistent ones. Contradicting yourself across similar questions is the real risk.",
            ],
          },
          {
            id: "l2",
            title: "Answering authentically",
            type: "reading",
            duration: 5,
            content: [
              "Trying to 'game' a personality test usually backfires — the questions are designed to catch inconsistency.",
              "Answer as your best professional self on a good day. Consistent, genuine responses read as confidence.",
            ],
          },
        ],
      },
    ],
  },
];

const staticExams = {
  "critical-thinking": {
    categorySlug: "critical-thinking",
    categoryName: "Critical Thinking",
    durationMinutes: 5,
    questions: [
      {
        id: "ct1",
        prompt: "Assumption: 'Most people who buy high-end smartphones are purchasing them for social status rather than features.' Which of the following, if true, most weakens the argument?",
        options: [
          { id: "a", text: "80% of high-end smartphone buyers report using advanced features daily for their business operations." },
          { id: "b", text: "Social media use is highest among buyers of mid-range smartphones." },
          { id: "c", text: "Many people feel pressure to own modern electronics in professional settings." },
          { id: "d", text: "High-end smartphones are twice as expensive as mid-range phones." },
        ],
        correctId: "a",
        explanation: "If 80% of buyers use advanced features daily for business, it directly refutes the claim that the primary reason for purchasing is social status rather than features.",
      },
      {
        id: "ct2",
        prompt: "Argument: 'Cars cause pollution, so we should ban all personal vehicles immediately.' Which of the following represents the main logical flaw in this argument?",
        options: [
          { id: "a", text: "It assumes that all cars cause the same amount of pollution." },
          { id: "b", text: "It proposes an extreme solution without considering the economic or social impact." },
          { id: "c", text: "It ignores the fact that public transit also produces pollution." },
          { id: "d", text: "It relies on outdated statistics about vehicular emissions." },
        ],
        correctId: "b",
        explanation: "The argument jumps from a statement of fact ('Cars cause pollution') to an extreme, unmoderated solution ('ban all personal vehicles immediately') without reasoning or considering feasibility/impact.",
      },
      {
        id: "ct3",
        prompt: "Passage: 'No musicians are accountants. All accountants are detail-oriented.' Which of the following must be true based on the statements?",
        options: [
          { id: "a", text: "No musicians are detail-oriented." },
          { id: "b", text: "Some detail-oriented people are not musicians." },
          { id: "c", text: "All detail-oriented people are accountants." },
          { id: "d", text: "Some musicians are detail-oriented." },
        ],
        correctId: "b",
        explanation: "Since all accountants are detail-oriented, and no accountants are musicians, there exists a group of detail-oriented people (the accountants) who cannot be musicians. Therefore, some detail-oriented people are not musicians.",
      },
    ],
  },
  "spatial-reasoning": {
    categorySlug: "spatial-reasoning",
    categoryName: "Spatial Reasoning",
    durationMinutes: 5,
    questions: [
      {
        id: "sr1",
        prompt: "If a 3D cube is unfolded, which of the following shapes is NOT a valid net for a cube?",
        options: [
          { id: "a", text: "A T-shape consisting of 6 squares." },
          { id: "b", text: "A cross shape consisting of 6 squares." },
          { id: "c", text: "A straight line of 6 squares." },
          { id: "d", text: "A Z-like step shape consisting of 6 squares." },
        ],
        correctId: "c",
        explanation: "A straight line of 6 squares cannot fold into a cube because the sides would overlap and fail to close the ends.",
      },
      {
        id: "sr2",
        prompt: "You rotate a 2D shape 90 degrees clockwise, and then reflect it horizontally. If the starting shape was a letter 'L', what is the final orientation?",
        options: [
          { id: "a", text: "An upside-down 'L'." },
          { id: "b", text: "A normal 'L'." },
          { id: "c", text: "A backward 'L'." },
          { id: "d", text: "An upside-down and backward 'L'." },
        ],
        correctId: "d",
        explanation: "Rotating 'L' 90 degrees clockwise turns it on its back. Reflecting it horizontally flips it vertically, ending up as an upside-down and backward 'L'.",
      },
    ],
  },
  "three-digit-reasoning": {
    categorySlug: "three-digit-reasoning",
    categoryName: "Three Digit Reasoning",
    durationMinutes: 5,
    questions: [
      {
        id: "td1",
        prompt: "What is the next number in the sequence: 125, 250, 375, 500, ...?",
        options: [
          { id: "a", text: "600" },
          { id: "b", text: "625" },
          { id: "c", text: "650" },
          { id: "d", text: "700" },
        ],
        correctId: "b",
        explanation: "The sequence increases by adding 125 at each step. 500 + 125 = 625.",
      },
      {
        id: "td2",
        prompt: "Which number completes the equation: 8 * [?] = 288 / [?] ?",
        options: [
          { id: "a", text: "4" },
          { id: "b", text: "5" },
          { id: "c", text: "6" },
          { id: "d", text: "8" },
        ],
        correctId: "c",
        explanation: "If [?] is x, the equation is 8x = 288 / x, which simplifies to 8x^2 = 288. Dividing by 8 gives x^2 = 36, so x = 6. 8 * 6 = 48, and 288 / 6 = 48.",
      },
    ],
  },
  "mechanical-reasoning": {
    categorySlug: "mechanical-reasoning",
    categoryName: "Mechanical Reasoning",
    durationMinutes: 5,
    questions: [
      {
        id: "mr1",
        prompt: "A large gear with 30 teeth drives a smaller gear with 10 teeth. If the large gear rotates clockwise at 10 RPM, in which direction and speed does the smaller gear rotate?",
        options: [
          { id: "a", text: "Counter-clockwise, 30 RPM" },
          { id: "b", text: "Clockwise, 30 RPM" },
          { id: "c", text: "Counter-clockwise, 10 RPM" },
          { id: "d", text: "Clockwise, 3.33 RPM" },
        ],
        correctId: "a",
        explanation: "Meshing gears always rotate in opposite directions. The speed ratio is the inverse of the teeth ratio: (30/10) * 10 RPM = 30 RPM.",
      },
      {
        id: "mr2",
        prompt: "If you push down on one end of a balanced lever that is closer to the fulcrum than the object on the other end, is the effort required greater than, less than, or equal to the weight of the object?",
        options: [
          { id: "a", text: "Greater than" },
          { id: "b", text: "Less than" },
          { id: "c", text: "Equal to" },
          { id: "d", text: "Zero effort" },
        ],
        correctId: "a",
        explanation: "When your effort arm is shorter than the load arm, you lose mechanical advantage, meaning you must exert greater force than the weight of the load.",
      },
    ],
  },
  "numerical-reasoning": {
    categorySlug: "numerical-reasoning",
    categoryName: "Numerical Reasoning",
    durationMinutes: 5,
    questions: [
      {
        id: "nr1",
        prompt: "A company's revenue increased by 10% in Year 1 and then decreased by 10% in Year 2. What is the net change in revenue from the start of Year 1 to the end of Year 2?",
        options: [
          { id: "a", text: "0% (no change)" },
          { id: "b", text: "1% increase" },
          { id: "c", text: "1% decrease" },
          { id: "d", text: "2% decrease" },
        ],
        correctId: "c",
        explanation: "Let starting revenue be 100. Year 1: 100 * 1.10 = 110. Year 2: 110 * 0.90 = 99. Net change is a decrease of 1% (99 vs 100).",
      },
      {
        id: "nr2",
        prompt: "If a vehicle travels at a constant speed of 80 km/h, how long will it take to travel 120 kilometers?",
        options: [
          { id: "a", text: "1 hour 15 minutes" },
          { id: "b", text: "1 hour 30 minutes" },
          { id: "c", text: "1 hour 45 minutes" },
          { id: "d", text: "2 hours" },
        ],
        correctId: "b",
        explanation: "Time = Distance / Speed = 120 / 80 = 1.5 hours. 1.5 hours is equal to 1 hour and 30 minutes.",
      },
    ],
  },
  "verbal-reasoning": {
    categorySlug: "verbal-reasoning",
    categoryName: "Verbal Reasoning",
    durationMinutes: 5,
    questions: [
      {
        id: "vr1",
        prompt: "Passage: 'A group of scientists recently discovered a species of tree frog that thrives only in environments with high humidity and constant shade. They noted that the frog is highly vulnerable to predators when exposed to sunlight.' Statement: 'The newly discovered frog species can live in dry climates if they find shade.' Based on the passage, the statement is:",
        options: [
          { id: "a", text: "True" },
          { id: "b", text: "False" },
          { id: "c", text: "Cannot Say" },
        ],
        correctId: "b",
        explanation: "The passage states that the frog thrives *only* in environments with high humidity (and constant shade). Thus, it cannot live in dry climates, making the statement false.",
      },
      {
        id: "vr2",
        prompt: "Passage: 'All members of the board voted in favor of the merger. However, three of the members expressed strong concerns about post-merger integration challenges.' Statement: 'A minority of board members were against the merger.' Based on the passage, the statement is:",
        options: [
          { id: "a", text: "True" },
          { id: "b", text: "False" },
          { id: "c", text: "Cannot Say" },
        ],
        correctId: "b",
        explanation: "The passage states that *all* members of the board voted in favor of the merger. Therefore, zero members voted against it, which directly contradicts the statement that a minority was against it.",
      },
    ],
  },
};

async function main() {
  console.log("Seeding courses...");

  for (const c of staticCourses) {
    const course = await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        subtitle: c.subtitle,
        category: c.category,
        instructor: c.instructor,
        cover: c.cover,
        description: c.description,
        price: c.price,
      },
      create: {
        slug: c.slug,
        title: c.title,
        subtitle: c.subtitle,
        category: c.category,
        instructor: c.instructor,
        cover: c.cover,
        description: c.description,
        price: c.price,
      },
    });

    await prisma.module.deleteMany({ where: { courseSlug: c.slug } });

    for (const m of c.modules) {
      const dbModule = await prisma.module.create({
        data: {
          moduleId: m.id,
          title: m.title,
          courseSlug: course.slug,
        },
      });

      for (const l of m.lessons) {
        const dbLesson = await prisma.lesson.create({
          data: {
            lessonId: l.id,
            title: l.title,
            type: l.type.toUpperCase() as any,
            duration: l.duration,
            content: JSON.stringify(l.content),
            moduleId: dbModule.id,
          },
        });

        if (l.type === "quiz" && "questions" in l && l.questions) {
          for (const q of l.questions) {
            await prisma.quizQuestion.create({
              data: {
                questionId: q.id,
                prompt: q.prompt,
                options: JSON.stringify(q.options),
                correctId: q.correctId,
                explanation: q.explanation,
                lessonId: dbLesson.id,
              },
            });
          }
        }
      }
    }
  }

  console.log("Seeding practice exams...");

  for (const ex of Object.values(staticExams)) {
    const exam = await prisma.practiceExam.upsert({
      where: { categorySlug: ex.categorySlug },
      update: {
        categoryName: ex.categoryName,
        durationMinutes: ex.durationMinutes,
      },
      create: {
        categorySlug: ex.categorySlug,
        categoryName: ex.categoryName,
        durationMinutes: ex.durationMinutes,
      },
    });

    await prisma.examQuestion.deleteMany({ where: { examSlug: ex.categorySlug } });

    for (const q of ex.questions) {
      await prisma.examQuestion.create({
        data: {
          questionId: q.id,
          prompt: q.prompt,
          options: JSON.stringify(q.options),
          correctId: q.correctId,
          explanation: q.explanation,
          examSlug: exam.categorySlug,
        },
      });
    }
  }

  console.log("Seeding admin user...");
  const passwordHash = await require("bcryptjs").hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@tekskillup.com" },
    update: {
      passwordHash,
      role: "ADMIN",
      category: "SUPER_ADMIN",
    },
    create: {
      email: "admin@tekskillup.com",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
      category: "SUPER_ADMIN",
      gamification: {
        create: {
          xp: 1500,
          streak: 5,
          lastActive: "2026-07-15",
        },
      },
    },
  });

  // ── Email Templates ─────────────────────────────────────────
  console.log("Seeding email templates...");

  const emailTemplates = [
    {
      key: "welcome-registration",
      name: "Welcome — New Registration",
      description: "Sent when a new student registers an account.",
      subject: "Welcome to {{site_name}}, {{user_name}}!",
      body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px">Welcome to {{site_name}}</h1>
    <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0">Your learning journey starts now</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none">
    <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">You're registered! 🎉</h2>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px">Hi {{user_name}},</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px">Your account has been created successfully. You now have access to our entire catalogue of courses, practice exams, and career resources.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px;width:120px">Account</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{user_email}}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px">Platform</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{site_name}}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{login_url}}" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none">Get Started →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">If you have any questions, reach out to us at <a href="mailto:{{support_email}}" style="color:#3b82f6">{{support_email}}</a>.</p>
  </div>
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">© {{site_name}} · All rights reserved</div>
</div>`,
    },
    {
      key: "course-enrollment",
      name: "Course Enrollment Confirmation",
      description: "Sent when a student enrolls in a new course.",
      subject: "You're enrolled in {{course_title}} — {{site_name}}",
      body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px">Enrollment Confirmed</h1>
    <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0">{{course_title}}</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none">
    <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">You're in! 🚀</h2>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px">Hi {{user_name}},</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px">You have successfully enrolled in <strong>{{course_title}}</strong>. Your course materials are ready and waiting for you.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px;width:120px">Course</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{course_title}}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px">Student</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{user_name}}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px">Email</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{user_email}}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{login_url}}" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none">Start Learning →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">Need help? Contact us at <a href="mailto:{{support_email}}" style="color:#3b82f6">{{support_email}}</a>.</p>
  </div>
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">© {{site_name}} · All rights reserved</div>
</div>`,
    },
    {
      key: "course-completion",
      name: "Course Completion Certificate",
      description: "Sent when a student completes all lessons in a course.",
      subject: "Congratulations! You've completed {{course_title}}",
      body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px">Course Completed!</h1>
    <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0">{{course_title}}</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none">
    <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Outstanding work, {{user_name}}! 🏆</h2>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px">You have successfully completed all modules and lessons in <strong>{{course_title}}</strong>. Your certificate of completion is now available for download.</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
      <p style="font-size:13px;font-weight:700;color:#1e40af;margin:0 0 4px">Certificate Issued</p>
      <p style="font-size:12px;color:#475569;margin:0">Download or share your verified credential from your dashboard.</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px;width:120px">Course</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{course_title}}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px">Student</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{user_name}}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{login_url}}" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none">View Certificate →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">Questions? Reach us at <a href="mailto:{{support_email}}" style="color:#3b82f6">{{support_email}}</a>.</p>
  </div>
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">© {{site_name}} · All rights reserved</div>
</div>`,
    },
    {
      key: "password-reset",
      name: "Password Reset Request",
      description: "Sent when a user requests a password reset.",
      subject: "Reset your password — {{site_name}}",
      body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px">Password Reset</h1>
    <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0">{{site_name}}</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none">
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px">Hi {{user_name}},</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px">We received a request to reset the password associated with <strong>{{user_email}}</strong>. Click the button below to choose a new password.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="{{login_url}}" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none">Reset Password →</a>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:0 0 20px">
      <p style="font-size:12px;color:#1e40af;margin:0"><strong>Security notice:</strong> If you didn't request this, you can safely ignore this email. The link expires in 60 minutes.</p>
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">Need help? Contact <a href="mailto:{{support_email}}" style="color:#3b82f6">{{support_email}}</a>.</p>
  </div>
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">© {{site_name}} · All rights reserved</div>
</div>`,
    },
    {
      key: "exam-results",
      name: "Practice Exam Results",
      description: "Sent after a student completes a practice exam with their score summary.",
      subject: "Your {{course_title}} exam results are ready — {{site_name}}",
      body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);border-radius:16px 16px 0 0;padding:40px 32px;text-align:center">
    <h1 style="color:#ffffff;font-size:22px;margin:0 0 6px">Exam Results</h1>
    <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0">{{course_title}}</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none">
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 16px">Hi {{user_name}},</p>
    <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 20px">You've just completed the <strong>{{course_title}}</strong> practice exam. Here's a summary of your performance:</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px;width:120px">Exam</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{course_title}}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:700;color:#1e293b;font-size:13px">Student</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;font-size:13px">{{user_name}}</td></tr>
    </table>
    <div style="text-align:center;margin:28px 0">
      <a href="{{login_url}}" style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none">View Full Results →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0">Keep practising! Reach out to <a href="mailto:{{support_email}}" style="color:#3b82f6">{{support_email}}</a> with questions.</p>
  </div>
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:11px">© {{site_name}} · All rights reserved</div>
</div>`,
    },
  ];

  for (const tpl of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key: tpl.key },
      update: {
        name: tpl.name,
        description: tpl.description,
        subject: tpl.subject,
        body: tpl.body,
      },
      create: tpl,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
