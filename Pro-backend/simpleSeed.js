import Admin from './src/models/admin.model.js';
import Tutor from './src/models/tutor.model.js';
import Student from './src/models/student.model.js';
import Course from './src/models/course.model.js';
import db from './src/config/db.js';

console.log('🌱 Starting SkillBridge Database Seeding...\n');

const seedData = async () => {
  try {
    // Connect to database
    await db();
    console.log('✅ Database connected');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      Admin.deleteMany({}),
      Tutor.deleteMany({}),
      Student.deleteMany({}),
      Course.deleteMany({}),
    ]);
    console.log('✅ Existing data cleared');

    // Create Admin
    console.log('👑 Creating admin...');
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@skillbridge.com',
      password: 'Admin@123',
      confirmPassword: 'Admin@123',
      role: 'superadmin',
    });
    await admin.save();
    console.log('✅ Admin created');

    // Create Tutors
    console.log('👨‍🏫 Creating tutors...');
    const tutorData = [
      {
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@skillbridge.com',
        password: 'Tutor@123',
        confirmPassword: 'Tutor@123',
        expertise: ['React', 'JavaScript', 'Web Development'],
        experience: 8,
        bio: 'Full-stack developer with 8+ years of experience.',
        qualifications: 'PhD in Computer Science',
      },
      {
        name: 'Mark Johnson',
        email: 'mark.johnson@skillbridge.com',
        password: 'Tutor@123',
        confirmPassword: 'Tutor@123',
        expertise: ['Python', 'Machine Learning', 'Data Science'],
        experience: 6,
        bio: 'Data scientist and ML engineer.',
        qualifications: 'MS in Data Science',
      },
    ];

    const tutors = [];
    for (const tData of tutorData) {
      const tutor = new Tutor(tData);
      await tutor.save();
      tutors.push(tutor);
    }
    console.log(`✅ Created ${tutors.length} tutors`);

    // Create Students
    console.log('👨‍🎓 Creating students...');
    const studentData = [
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@email.com',
        password: 'Student@123',
        confirmPassword: 'Student@123',
      },
      {
        name: 'Jessica Rodriguez',
        email: 'jessica.rodriguez@email.com',
        password: 'Student@123',
        confirmPassword: 'Student@123',
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        password: 'Student@123',
        confirmPassword: 'Student@123',
      },
    ];

    const students = [];
    for (const sData of studentData) {
      const student = new Student(sData);
      await student.save();
      students.push(student);
    }
    console.log(`✅ Created ${students.length} students`);

    // Create Courses
    console.log('📚 Creating courses...');
    const courseData = [
      {
        title: 'Complete React Development Bootcamp',
        description:
          'Master React from basics to advanced concepts. Build real-world applications with React hooks, context, and modern patterns.',
        tutor: tutors[0]._id,
        category: 'Web Development',
        level: 'Intermediate',
        price: 4999,
        duration: 40,
        language: 'English',
        prerequisites: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
        learningOutcomes: [
          'Build modern React applications',
          'Master React hooks and context',
          'Implement state management',
          'Deploy React apps to production',
        ],
        chapters: [
          {
            title: 'React Fundamentals',
            description: 'Learn the core concepts of React',
            order: 1,
            subchapters: [
              {
                title: 'Introduction to React',
                description: 'What is React and why use it?',
                order: 1,
                duration: 30,
                content:
                  'React is a powerful JavaScript library for building user interfaces.',
                videoUrl: 'https://example.com/react-intro',
              },
              {
                title: 'JSX and Components',
                description: 'Understanding JSX syntax and components',
                order: 2,
                duration: 45,
                content:
                  'JSX allows us to write HTML-like syntax in JavaScript.',
                videoUrl: 'https://example.com/jsx-components',
              },
            ],
          },
        ],
        isPublished: true,
        enrollmentCount: 156,
        rating: 4.8,
        reviews: 89,
      },
      {
        title: 'Python for Data Science Masterclass',
        description:
          'Complete guide to data science with Python. Learn pandas, NumPy, matplotlib, and machine learning basics.',
        tutor: tutors[1]._id,
        category: 'Data Science',
        level: 'Beginner',
        price: 3999,
        duration: 35,
        language: 'English',
        prerequisites: ['Basic programming knowledge'],
        learningOutcomes: [
          'Master Python for data analysis',
          'Work with pandas and NumPy',
          'Create data visualizations',
          'Build basic ML models',
        ],
        chapters: [
          {
            title: 'Python Basics for Data Science',
            description: 'Essential Python concepts for data work',
            order: 1,
            subchapters: [
              {
                title: 'Python Fundamentals',
                description: 'Variables, data types, and control structures',
                order: 1,
                duration: 40,
                content: 'Python is an excellent language for data science.',
                videoUrl: 'https://example.com/python-fundamentals',
              },
            ],
          },
        ],
        isPublished: true,
        enrollmentCount: 203,
        rating: 4.7,
        reviews: 127,
      },
    ];

    const courses = [];
    for (const cData of courseData) {
      const course = new Course(cData);
      await course.save();
      courses.push(course);
    }
    console.log(`✅ Created ${courses.length} courses`);

    // Enroll some students in courses
    console.log('📝 Creating enrollments...');
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const enrolledCourses = courses.slice(
        0,
        Math.floor(Math.random() * 2) + 1
      );

      student.enrolledCourses = enrolledCourses.map((c) => c._id);
      student.courseProgress = enrolledCourses.map((c) => ({
        courseId: c._id,
        progress: Math.floor(Math.random() * 101),
        completedLessons: [],
        lastAccessed: new Date(),
      }));

      await student.save();
    }
    console.log('✅ Created enrollments');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('='.repeat(50));
    console.log('👑 ADMIN:');
    console.log('   Email: admin@skillbridge.com');
    console.log('   Password: Admin@123');
    console.log('\n👨‍🏫 TUTORS:');
    tutorData.forEach((tutor) => {
      console.log(`   Email: ${tutor.email}`);
      console.log(`   Password: ${tutor.password}`);
    });
    console.log('\n👨‍🎓 STUDENTS:');
    studentData.forEach((student) => {
      console.log(`   Email: ${student.email}`);
      console.log(`   Password: ${student.password}`);
    });
    console.log('='.repeat(50));

    return {
      admins: 1,
      tutors: tutors.length,
      students: students.length,
      courses: courses.length,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

seedData()
  .then((result) => {
    console.log('\n📊 Seeding Summary:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
