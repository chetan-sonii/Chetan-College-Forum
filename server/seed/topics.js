const mongoose = require("mongoose");
const Topic = require("../models/topicModel");
require("dotenv").config();

const topics = [
        {
            owner: "admin",
            title: "What is the difference between REST and GraphQL?",
            content: "I am confused between REST APIs and GraphQL. Can someone explain the differences, advantages, and when to use each?",
            slug: "difference-between-rest-and-graphql",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 120,
            totalComments: 5
        },
        {
            owner: "rahul_dev",
            title: "Best practices for securing JWT authentication",
            content: "What are the best practices for storing JWT tokens securely on frontend and backend?",
            slug: "best-practices-for-securing-jwt-authentication",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 89,
            totalComments: 3
        },
        {
            owner: "chetan",
            title: "How does MongoDB indexing improve performance?",
            content: "Can someone explain how indexing works in MongoDB and when we should use compound indexes?",
            slug: "how-does-mongodb-indexing-improve-performance",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 156,
            totalComments: 7
        },
        {
            owner: "priya_codes",
            title: "Difference between SQL and NoSQL databases",
            content: "Which one should I choose for a scalable application: SQL or NoSQL?",
            slug: "difference-between-sql-and-nosql-databases",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 210,
            totalComments: 9
        },
        {
            owner: "dev_ankit",
            title: "What is Docker and why is it used?",
            content: "I keep hearing about Docker. What problem does it solve and how does it work?",
            slug: "what-is-docker-and-why-is-it-used",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 300,
            totalComments: 12
        },
        {
            owner: "admin",
            title: "How does authentication differ from authorization?",
            content: "Many people use these terms interchangeably. What is the real difference?",
            slug: "authentication-vs-authorization",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 98,
            totalComments: 4
        },
        {
            owner: "chetan",
            title: "What is middleware in Express.js?",
            content: "Can someone explain middleware with real-world examples in Express?",
            slug: "what-is-middleware-in-express-js",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 145,
            totalComments: 6
        },
        {
            owner: "frontend_girl",
            title: "React useEffect vs useMemo vs useCallback",
            content: "I often misuse hooks. When should we use useEffect, useMemo, and useCallback?",
            slug: "react-useeffect-vs-usememo-vs-usecallback",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 265,
            totalComments: 10
        },
        {
            owner: "node_master",
            title: "How does Node.js handle asynchronous operations?",
            content: "Can someone explain the event loop, call stack, and task queue in Node.js?",
            slug: "how-nodejs-handles-asynchronous-operations",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 190,
            totalComments: 8
        },
        {
            owner: "dev_ops",
            title: "What is CI/CD and why is it important?",
            content: "How does CI/CD help in modern software development pipelines?",
            slug: "what-is-ci-cd-and-why-is-it-important",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 175,
            totalComments: 6
        },
        {
            owner: "student123",
            title: "Difference between HTTP and HTTPS",
            content: "Why is HTTPS more secure and how does SSL/TLS work?",
            slug: "difference-between-http-and-https",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 220,
            totalComments: 9
        },
        {
            owner: "backend_dev",
            title: "How to design a scalable REST API?",
            content: "What are the key principles of designing scalable REST APIs?",
            slug: "how-to-design-a-scalable-rest-api",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 310,
            totalComments: 14
        },
        {
            owner: "ai_enthusiast",
            title: "What is Machine Learning and how does it work?",
            content: "Beginner-friendly explanation of machine learning concepts.",
            slug: "what-is-machine-learning-and-how-does-it-work",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 400,
            totalComments: 20
        },
        {
            owner: "cloud_guy",
            title: "What is cloud computing?",
            content: "Difference between IaaS, PaaS, and SaaS with examples.",
            slug: "what-is-cloud-computing",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 360,
            totalComments: 15
        },
        {
            owner: "security_pro",
            title: "Common web security vulnerabilities every developer should know",
            content: "Discussion about XSS, CSRF, SQL Injection, and how to prevent them.",
            slug: "common-web-security-vulnerabilities",
            tags: [],
            upvotes: [],
            downvotes: [],
            viewsCount: 280,
            totalComments: 11
        }
    ]
;

(async () => {
    try {
        await mongoose.connect('mongodb+srv://chetansonii2000_db_user:chetan309204@collegeforum.y1vvpxj.mongodb.net/');
        await Topic.insertMany(topics);
        console.log("✅ Topics seeded successfully");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
