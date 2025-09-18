/**
 * Sample Data Generator for NEP 2020 Compliant Smart Timetable System
 * Generates realistic data for B.Ed, M.Ed, FYUP, and ITEP programs
 */

import { v4 as uuidv4 } from 'uuid';
import { Student, Faculty, Course, Room, TimeSlot, TimetableEntry, COURSE_CATEGORIES } from '../models/nep2020-models.js';

/**
 * Generate comprehensive sample data for testing and demonstration
 */
class SampleDataGenerator {
  constructor() {
    this.timeSlots = this.generateTimeSlots();
    this.rooms = this.generateRooms();
    this.faculty = this.generateFaculty();
    this.courses = this.generateCourses();
    this.students = this.generateStudents();
  }

  /**
   * Generate time slots for the institution
   */
  generateTimeSlots() {
    const slots = [
      new TimeSlot('09:00', '10:00'),
      new TimeSlot('10:00', '11:00'),
      new TimeSlot('11:00', '12:00'),
      new TimeSlot('12:00', '13:00'),
      new TimeSlot('14:00', '15:00'), // After lunch break
      new TimeSlot('15:00', '16:00'),
      new TimeSlot('16:00', '17:00'),
      new TimeSlot('17:00', '18:00') // Evening slot
    ];
    return slots;
  }

  /**
   * Generate rooms with different types and capacities
   */
  generateRooms() {
    const rooms = [];

    // Regular classrooms
    for (let i = 101; i <= 110; i++) {
      rooms.push(new Room({
        id: `room-${i}`,
        name: `Room ${i}`,
        building: 'Main Block',
        floor: Math.floor(i / 100),
        capacity: 40 + (i % 3) * 20, // 40, 60, or 80
        type: 'regular_classroom',
        equipment: ['projector', 'whiteboard', 'internet']
      }));
    }

    // Large classrooms
    for (let i = 201; i <= 205; i++) {
      rooms.push(new Room({
        id: `room-${i}`,
        name: `Hall ${i}`,
        building: 'Academic Block',
        floor: 2,
        capacity: 100 + (i % 2) * 50, // 100 or 150
        type: 'large_classroom',
        equipment: ['projector', 'microphone', 'smartBoard', 'internet', 'audioSystem']
      }));
    }

    // Laboratories
    const labTypes = [
      { name: 'Computer Lab', type: 'computer_lab', equipment: ['computers', 'projector', 'internet', 'printers'] },
      { name: 'Physics Lab', type: 'physics_lab', equipment: ['lab_equipment', 'projector', 'safety_equipment'] },
      { name: 'Chemistry Lab', type: 'chemistry_lab', equipment: ['lab_equipment', 'fume_hood', 'safety_equipment'] },
      { name: 'Biology Lab', type: 'biology_lab', equipment: ['microscopes', 'lab_equipment', 'projector'] },
      { name: 'Language Lab', type: 'language_lab', equipment: ['audio_system', 'headphones', 'computers', 'internet'] }
    ];

    labTypes.forEach((lab, index) => {
      rooms.push(new Room({
        id: `lab-${300 + index}`,
        name: lab.name,
        building: 'Science Block',
        floor: 3,
        capacity: 30,
        type: lab.type,
        equipment: lab.equipment
      }));
    });

    // Seminar halls
    for (let i = 401; i <= 403; i++) {
      rooms.push(new Room({
        id: `seminar-${i}`,
        name: `Seminar Hall ${i}`,
        building: 'Conference Block',
        floor: 4,
        capacity: 50,
        type: 'seminar_hall',
        equipment: ['projector', 'microphone', 'smartBoard', 'internet', 'audioSystem', 'videoConferencing']
      }));
    }

    // Set features for all rooms
    rooms.forEach(room => {
      room.features = {
        airConditioning: Math.random() > 0.5,
        projector: room.equipment.includes('projector'),
        smartBoard: room.equipment.includes('smartBoard'),
        internet: room.equipment.includes('internet'),
        audioSystem: room.equipment.includes('audioSystem')
      };
    });

    return rooms;
  }

  /**
   * Generate faculty members with expertise in different areas
   */
  generateFaculty() {
    const faculty = [];

    // Education faculty for B.Ed and M.Ed programs
    const educationFaculty = [
      {
        name: 'Dr. Priya Sharma',
        department: 'Education',
        designation: 'Professor',
        expertise: ['Educational Psychology', 'Child Development', 'Research Methodology'],
        programs: ['B.Ed', 'M.Ed']
      },
      {
        name: 'Prof. Rajesh Kumar',
        department: 'Education',
        designation: 'Associate Professor',
        expertise: ['Curriculum Development', 'Educational Technology', 'Assessment'],
        programs: ['B.Ed', 'M.Ed', 'ITEP']
      },
      {
        name: 'Dr. Sunita Verma',
        department: 'Education',
        designation: 'Assistant Professor',
        expertise: ['Special Education', 'Inclusive Education', 'Language Teaching'],
        programs: ['B.Ed', 'M.Ed']
      },
      {
        name: 'Dr. Amit Gupta',
        department: 'Education',
        designation: 'Professor',
        expertise: ['Philosophy of Education', 'Educational Administration', 'Teacher Training'],
        programs: ['B.Ed', 'M.Ed', 'ITEP']
      }
    ];

    // Subject faculty for content courses
    const subjectFaculty = [
      {
        name: 'Dr. Mathematics Singh',
        department: 'Mathematics',
        expertise: ['Mathematics', 'Statistics', 'Mathematical Education'],
        programs: ['B.Ed', 'FYUP', 'ITEP']
      },
      {
        name: 'Prof. Physics Rao',
        department: 'Physics',
        expertise: ['Physics', 'Applied Physics', 'Science Education'],
        programs: ['B.Ed', 'FYUP', 'ITEP']
      },
      {
        name: 'Dr. Chemistry Patel',
        department: 'Chemistry',
        expertise: ['Chemistry', 'Organic Chemistry', 'Science Education'],
        programs: ['B.Ed', 'FYUP', 'ITEP']
      },
      {
        name: 'Prof. English Smith',
        department: 'English',
        expertise: ['English Literature', 'Linguistics', 'Language Teaching'],
        programs: ['B.Ed', 'FYUP', 'ITEP']
      },
      {
        name: 'Dr. History Khan',
        department: 'History',
        expertise: ['History', 'Social Studies', 'Educational History'],
        programs: ['B.Ed', 'FYUP']
      },
      {
        name: 'Prof. Geography Nair',
        department: 'Geography',
        expertise: ['Geography', 'Environmental Studies', 'GIS'],
        programs: ['B.Ed', 'FYUP']
      },
      {
        name: 'Dr. Computer Agarwal',
        department: 'Computer Science',
        expertise: ['Computer Science', 'Programming', 'Educational Technology'],
        programs: ['FYUP', 'ITEP']
      },
      {
        name: 'Prof. Psychology Menon',
        department: 'Psychology',
        expertise: ['Psychology', 'Child Psychology', 'Counseling'],
        programs: ['B.Ed', 'M.Ed', 'FYUP']
      }
    ];

    // Create Faculty objects
    [...educationFaculty, ...subjectFaculty].forEach((facData, index) => {
      const facultyMember = new Faculty({
        id: `fac-${String(index + 1).padStart(3, '0')}`,
        name: facData.name,
        email: `${facData.name.toLowerCase().replace(/[^a-z]/g, '')}@university.edu`,
        department: facData.department,
        designation: facData.designation || 'Assistant Professor',
        qualification: 'Ph.D.',
        experience: 5 + Math.floor(Math.random() * 15) // 5-20 years
      });

      // Set expertise and programs
      facultyMember.expertise = facData.expertise;
      facultyMember.programs = facData.programs;
      facultyMember.courseCategories = [
        COURSE_CATEGORIES.CORE,
        COURSE_CATEGORIES.MAJOR,
        COURSE_CATEGORIES.ELECTIVE
      ];

      // Set workload
      facultyMember.workload = {
        maxHoursPerWeek: 18,
        currentHours: 0,
        maxCoursesPerSemester: 4,
        currentCourses: 0
      };

      // Set availability (Monday to Saturday, 9 AM to 6 PM)
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      days.forEach(day => {
        facultyMember.availability[day] = this.timeSlots.map(slot => slot.label);
      });

      // Teaching practice supervision (education faculty only)
      if (facData.department === 'Education') {
        facultyMember.teachingPracticeSupervision = {
          canSupervise: true,
          maxStudents: 10,
          currentStudents: 0,
          preferredSchools: ['Government School A', 'Private School B', 'Model School C']
        };
      }

      faculty.push(facultyMember);
    });

    return faculty;
  }

  /**
   * Generate courses for all NEP 2020 programs
   */
  generateCourses() {
    const courses = [];

    // B.Ed Courses
    const bedCourses = [
      // Core Education Courses
      { name: 'Childhood and Growing Up', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 1, type: 'theory' },
      { name: 'Contemporary India and Education', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 1, type: 'theory' },
      { name: 'Learning and Teaching', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 2, type: 'theory' },
      { name: 'Assessment for Learning', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 3, type: 'theory' },
      { name: 'Creating an Inclusive School', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 4, type: 'theory' },
      
      // Major Courses (Subject specific)
      { name: 'Pedagogy of Mathematics', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 5, type: 'theory', subject: 'Mathematics' },
      { name: 'Pedagogy of Science', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 5, type: 'theory', subject: 'Science' },
      { name: 'Pedagogy of English', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 5, type: 'theory', subject: 'English' },
      { name: 'Pedagogy of Social Science', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 5, type: 'theory', subject: 'Social Science' },
      
      // Teaching Practice
      { name: 'Teaching Practice - I', category: COURSE_CATEGORIES.PRACTICUM, credits: 8, semester: 6, type: 'practical' },
      { name: 'Teaching Practice - II', category: COURSE_CATEGORIES.PRACTICUM, credits: 8, semester: 7, type: 'practical' },
      { name: 'Teaching Practice - III', category: COURSE_CATEGORIES.PRACTICUM, credits: 8, semester: 8, type: 'practical' },
      
      // Skill Enhancement
      { name: 'Educational Technology', category: COURSE_CATEGORIES.SKILL_BASED, credits: 2, semester: 3, type: 'practical' },
      { name: 'Communication Skills', category: COURSE_CATEGORIES.ABILITY_ENHANCEMENT, credits: 2, semester: 1, type: 'theory' },
      { name: 'Environmental Education', category: COURSE_CATEGORIES.VALUE_ADDED, credits: 2, semester: 2, type: 'theory' }
    ];

    // M.Ed Courses
    const medCourses = [
      { name: 'Advanced Educational Psychology', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 1, type: 'theory' },
      { name: 'Research Methodology in Education', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 1, type: 'theory' },
      { name: 'Curriculum Development', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 2, type: 'theory' },
      { name: 'Educational Administration', category: COURSE_CATEGORIES.ELECTIVE, credits: 4, semester: 3, type: 'theory' },
      { name: 'Dissertation', category: COURSE_CATEGORIES.DISSERTATION, credits: 8, semester: 4, type: 'research' },
      { name: 'Advanced Teaching Practice', category: COURSE_CATEGORIES.PRACTICUM, credits: 6, semester: 3, type: 'practical' }
    ];

    // FYUP Courses
    const fyupCourses = [
      // Core courses
      { name: 'Foundation Course in Humanities', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 1, type: 'theory' },
      { name: 'Foundation Course in Sciences', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 1, type: 'theory' },
      
      // Major courses
      { name: 'Advanced Mathematics', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 3, type: 'theory', subject: 'Mathematics' },
      { name: 'Modern Physics', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 3, type: 'theory', subject: 'Physics' },
      { name: 'Organic Chemistry', category: COURSE_CATEGORIES.MAJOR, credits: 6, semester: 3, type: 'theory', subject: 'Chemistry' },
      
      // Minor courses
      { name: 'Introduction to Psychology', category: COURSE_CATEGORIES.MINOR, credits: 4, semester: 2, type: 'theory' },
      { name: 'Computer Programming', category: COURSE_CATEGORIES.MINOR, credits: 4, semester: 2, type: 'practical' },
      
      // Multidisciplinary courses
      { name: 'Science and Society', category: COURSE_CATEGORIES.MULTIDISCIPLINARY, credits: 3, semester: 4, type: 'theory' },
      { name: 'Data Science Fundamentals', category: COURSE_CATEGORIES.MULTIDISCIPLINARY, credits: 3, semester: 5, type: 'practical' },
      
      // Skills and abilities
      { name: 'Digital Literacy', category: COURSE_CATEGORIES.SKILL_BASED, credits: 2, semester: 1, type: 'practical' },
      { name: 'Critical Thinking', category: COURSE_CATEGORIES.ABILITY_ENHANCEMENT, credits: 2, semester: 2, type: 'theory' }
    ];

    // ITEP Courses
    const itepCourses = [
      { name: 'Integrated Content and Pedagogy - Mathematics', category: COURSE_CATEGORIES.CORE, credits: 8, semester: 1, type: 'theory', subject: 'Mathematics' },
      { name: 'Integrated Content and Pedagogy - Science', category: COURSE_CATEGORIES.CORE, credits: 8, semester: 1, type: 'theory', subject: 'Science' },
      { name: 'Educational Foundations', category: COURSE_CATEGORIES.CORE, credits: 4, semester: 2, type: 'theory' },
      { name: 'Classroom Management', category: COURSE_CATEGORIES.PRACTICUM, credits: 4, semester: 3, type: 'practical' },
      { name: 'Extended Teaching Practice', category: COURSE_CATEGORIES.PRACTICUM, credits: 12, semester: 6, type: 'practical' }
    ];

    // Create Course objects
    const allCourses = [
      ...bedCourses.map(c => ({ ...c, program: 'B.Ed' })),
      ...medCourses.map(c => ({ ...c, program: 'M.Ed' })),
      ...fyupCourses.map(c => ({ ...c, program: 'FYUP' })),
      ...itepCourses.map(c => ({ ...c, program: 'ITEP' }))
    ];

    allCourses.forEach((courseData, index) => {
      const course = new Course({
        id: `course-${String(index + 1).padStart(3, '0')}`,
        code: `${courseData.program.replace('.', '')}${courseData.semester}${String(index % 100).padStart(2, '0')}`,
        name: courseData.name,
        credits: courseData.credits,
        program: courseData.program,
        semester: courseData.semester,
        category: courseData.category,
        type: courseData.type,
        prerequisites: []
      });

      // Set subject-specific properties
      if (courseData.subject) {
        course.subject = courseData.subject;
      }

      // Set capacity based on course type and level
      if (courseData.type === 'practical' || courseData.type === 'lab') {
        course.capacity = 30; // Smaller capacity for practical sessions
        course.roomType = 'laboratory';
      } else if (courseData.category === COURSE_CATEGORIES.CORE) {
        course.capacity = 60; // Larger capacity for core courses
        course.roomType = 'large_classroom';
      } else {
        course.capacity = 40; // Standard capacity
        course.roomType = 'regular_classroom';
      }

      // Set equipment requirements
      if (courseData.type === 'practical') {
        course.equipmentRequired = ['projector', 'computers'];
      } else if (courseData.subject === 'Science' || courseData.subject === 'Physics' || courseData.subject === 'Chemistry') {
        course.equipmentRequired = ['projector', 'lab_equipment'];
      } else {
        course.equipmentRequired = ['projector'];
      }

      courses.push(course);
    });

    return courses;
  }

  /**
   * Generate students for different programs
   */
  generateStudents() {
    const students = [];

    // Helper function to generate student names
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
                       'Ananya', 'Fatima', 'Aadhya', 'Arya', 'Sara', 'Diya', 'Myra', 'Aisha', 'Kavya', 'Priya'];
    const lastNames = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Patel', 'Agarwal', 'Yadav', 'Mishra', 'Jain'];

    // Generate B.Ed students (4 years, 8 semesters)
    for (let year = 1; year <= 4; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semester = (year - 1) * 2 + sem;
        for (let i = 1; i <= 25; i++) { // 25 students per semester
          const student = new Student({
            id: `bed-${year}${sem}-${String(i).padStart(3, '0')}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            email: `bed${year}${sem}${String(i).padStart(3, '0')}@university.edu`,
            program: 'B.Ed',
            year: year,
            semester: semester,
            rollNumber: `BED${new Date().getFullYear() - year + 1}${String(i).padStart(3, '0')}`,
            admissionYear: new Date().getFullYear() - year + 1
          });

          // Set electives based on semester
          if (semester >= 3) {
            student.electives.major = ['Mathematics Education']; // Simplified for demo
          }
          if (semester >= 5) {
            student.electives.skillBased = ['Educational Technology'];
          }

          students.push(student);
        }
      }
    }

    // Generate M.Ed students (2 years, 4 semesters)
    for (let year = 1; year <= 2; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semester = (year - 1) * 2 + sem;
        for (let i = 1; i <= 15; i++) { // 15 students per semester
          const student = new Student({
            id: `med-${year}${sem}-${String(i).padStart(3, '0')}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            email: `med${year}${sem}${String(i).padStart(3, '0')}@university.edu`,
            program: 'M.Ed',
            year: year,
            semester: semester,
            rollNumber: `MED${new Date().getFullYear() - year + 1}${String(i).padStart(3, '0')}`,
            admissionYear: new Date().getFullYear() - year + 1
          });

          students.push(student);
        }
      }
    }

    // Generate FYUP students (4 years, 8 semesters)
    for (let year = 1; year <= 4; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semester = (year - 1) * 2 + sem;
        for (let i = 1; i <= 30; i++) { // 30 students per semester
          const student = new Student({
            id: `fyup-${year}${sem}-${String(i).padStart(3, '0')}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            email: `fyup${year}${sem}${String(i).padStart(3, '0')}@university.edu`,
            program: 'FYUP',
            year: year,
            semester: semester,
            rollNumber: `FYUP${new Date().getFullYear() - year + 1}${String(i).padStart(3, '0')}`,
            admissionYear: new Date().getFullYear() - year + 1
          });

          // Set electives based on semester
          if (semester >= 2) {
            student.electives.minor = ['Psychology'];
          }
          if (semester >= 4) {
            student.electives.multidisciplinary = ['Data Science'];
          }

          students.push(student);
        }
      }
    }

    // Generate ITEP students (4 years, 8 semesters)
    for (let year = 1; year <= 4; year++) {
      for (let sem = 1; sem <= 2; sem++) {
        const semester = (year - 1) * 2 + sem;
        for (let i = 1; i <= 20; i++) { // 20 students per semester
          const student = new Student({
            id: `itep-${year}${sem}-${String(i).padStart(3, '0')}`,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            email: `itep${year}${sem}${String(i).padStart(3, '0')}@university.edu`,
            program: 'ITEP',
            year: year,
            semester: semester,
            rollNumber: `ITEP${new Date().getFullYear() - year + 1}${String(i).padStart(3, '0')}`,
            admissionYear: new Date().getFullYear() - year + 1
          });

          students.push(student);
        }
      }
    }

    return students;
  }

  /**
   * Get all generated data
   */
  getAllData() {
    return {
      timeSlots: this.timeSlots,
      rooms: this.rooms,
      faculty: this.faculty,
      courses: this.courses,
      students: this.students,
      summary: {
        totalTimeSlots: this.timeSlots.length,
        totalRooms: this.rooms.length,
        totalFaculty: this.faculty.length,
        totalCourses: this.courses.length,
        totalStudents: this.students.length,
        programBreakdown: {
          'B.Ed': this.students.filter(s => s.program === 'B.Ed').length,
          'M.Ed': this.students.filter(s => s.program === 'M.Ed').length,
          'FYUP': this.students.filter(s => s.program === 'FYUP').length,
          'ITEP': this.students.filter(s => s.program === 'ITEP').length
        }
      }
    };
  }

  /**
   * Get data for a specific program
   */
  getProgramData(programName) {
    return {
      courses: this.courses.filter(c => c.program === programName),
      students: this.students.filter(s => s.program === programName),
      faculty: this.faculty.filter(f => f.programs.includes(programName)),
      rooms: this.rooms, // All rooms available
      timeSlots: this.timeSlots
    };
  }

  /**
   * Get data for a specific semester
   */
  getSemesterData(program, semester) {
    return {
      courses: this.courses.filter(c => c.program === program && c.semester === semester),
      students: this.students.filter(s => s.program === program && s.semester === semester),
      faculty: this.faculty.filter(f => f.programs.includes(program)),
      rooms: this.rooms,
      timeSlots: this.timeSlots
    };
  }
}

// Export singleton instance
const sampleDataGenerator = new SampleDataGenerator();
export default sampleDataGenerator;

// Export individual data arrays for convenience
export const {
  timeSlots,
  rooms,
  faculty,
  courses,
  students
} = sampleDataGenerator;