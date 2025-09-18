/**
 * NEP 2020 Compliant Data Models for Smart Timetable System
 * Supports B.Ed, M.Ed, FYUP, and ITEP programs
 */

// NEP 2020 Program Structures
export const NEP_PROGRAMS = {
  'B.Ed': {
    name: 'Bachelor of Education',
    duration: 4, // years
    totalCredits: 120,
    creditStructure: {
      major: 50,
      minor: 20,
      skillBased: 20,
      abilityEnhancement: 20,
      valueAdded: 10
    },
    teachingPractice: {
      required: true,
      semesters: [6, 7, 8],
      weeksPerSemester: 8,
      hoursPerWeek: 20
    },
    fieldWork: {
      required: true,
      totalHours: 100
    }
  },
  'M.Ed': {
    name: 'Master of Education',
    duration: 2,
    totalCredits: 80,
    creditStructure: {
      core: 40,
      elective: 20,
      dissertation: 10,
      practicum: 10
    },
    teachingPractice: {
      required: true,
      semesters: [3, 4],
      weeksPerSemester: 6,
      hoursPerWeek: 15
    }
  },
  'FYUP': {
    name: 'Four Year Undergraduate Program',
    duration: 4,
    totalCredits: 144,
    creditStructure: {
      major: 60,
      minor: 32,
      multidisciplinary: 20,
      abilityEnhancement: 16,
      skillEnhancement: 8,
      valueAdded: 8
    },
    exitOptions: {
      year1: 'Certificate',
      year2: 'Diploma',
      year3: 'Bachelor (General)',
      year4: 'Bachelor (Honours)'
    }
  },
  'ITEP': {
    name: 'Integrated Teacher Education Program',
    duration: 4,
    totalCredits: 140,
    creditStructure: {
      content: 70,
      pedagogy: 40,
      practice: 20,
      research: 10
    },
    teachingPractice: {
      required: true,
      semesters: [6, 7, 8],
      weeksPerSemester: 10,
      hoursPerWeek: 25
    }
  }
};

// Course Categories as per NEP 2020
export const COURSE_CATEGORIES = {
  MAJOR: 'major',
  MINOR: 'minor',
  SKILL_BASED: 'skillBased',
  ABILITY_ENHANCEMENT: 'abilityEnhancement',
  VALUE_ADDED: 'valueAdded',
  MULTIDISCIPLINARY: 'multidisciplinary',
  CORE: 'core',
  ELECTIVE: 'elective',
  PRACTICUM: 'practicum',
  DISSERTATION: 'dissertation'
};

// Student Data Model
class Student {
  constructor({
    id,
    name,
    email,
    program,
    year,
    semester,
    rollNumber,
    admissionYear
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.program = program; // B.Ed, M.Ed, FYUP, ITEP
    this.year = year;
    this.semester = semester;
    this.rollNumber = rollNumber;
    this.admissionYear = admissionYear;
    
    // NEP 2020 specific fields
    this.electives = {
      major: [],
      minor: [],
      skillBased: [],
      abilityEnhancement: [],
      valueAdded: [],
      multidisciplinary: []
    };
    
    this.creditStatus = {
      total: NEP_PROGRAMS[program]?.totalCredits || 0,
      completed: 0,
      enrolled: 0,
      remaining: NEP_PROGRAMS[program]?.totalCredits || 0
    };
    
    this.preferences = {
      timeSlots: [], // preferred time slots
      avoidDays: [], // days to avoid
      facultyPreferences: [],
      roomPreferences: []
    };
    
    // Teaching Practice (for education programs)
    this.teachingPractice = {
      completed: [],
      enrolled: null,
      schoolAssignment: null,
      supervisor: null
    };
  }
  
  // Calculate credit requirements based on NEP 2020
  getCreditRequirements() {
    const program = NEP_PROGRAMS[this.program];
    if (!program) return null;
    
    return {
      semesterwise: this.calculateSemesterCredits(),
      categorywise: program.creditStructure,
      remaining: this.creditStatus.remaining
    };
  }
  
  calculateSemesterCredits() {
    const totalSemesters = this.program === 'M.Ed' ? 4 : 8;
    const creditsPerSemester = this.creditStatus.total / totalSemesters;
    return creditsPerSemester;
  }
}

// Faculty Data Model
class Faculty {
  constructor({
    id,
    name,
    email,
    department,
    designation,
    qualification,
    experience
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.department = department;
    this.designation = designation; // Professor, Associate Professor, etc.
    this.qualification = qualification;
    this.experience = experience;
    
    // Teaching capabilities
    this.expertise = []; // Subject areas
    this.programs = []; // Programs they can teach (B.Ed, M.Ed, etc.)
    this.courseCategories = []; // Categories they can handle
    
    // Workload management
    this.workload = {
      maxHoursPerWeek: 18, // UGC guidelines
      currentHours: 0,
      maxCoursesPerSemester: 4,
      currentCourses: 0
    };
    
    // Availability
    this.availability = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    };
    
    // Teaching Practice supervision
    this.teachingPracticeSupervision = {
      canSupervise: false,
      maxStudents: 0,
      currentStudents: 0,
      preferredSchools: []
    };
    
    // Preferences
    this.preferences = {
      preferredTimeSlots: [],
      avoidBackToBack: true,
      maxDailyHours: 6,
      preferredPrograms: [],
      researchDays: [] // Days reserved for research
    };
  }
  
  // Check if faculty can teach a specific course
  canTeach(course) {
    return this.expertise.includes(course.subject) &&
           this.programs.includes(course.program) &&
           this.courseCategories.includes(course.category);
  }
  
  // Calculate current workload percentage
  getWorkloadPercentage() {
    return (this.workload.currentHours / this.workload.maxHoursPerWeek) * 100;
  }
  
  // Check availability for a time slot
  isAvailable(day, timeSlot) {
    return this.availability[day.toLowerCase()]?.includes(timeSlot) || false;
  }
}

// Course Data Model
class Course {
  constructor({
    id,
    code,
    name,
    credits,
    program,
    semester,
    category,
    type,
    prerequisites
  }) {
    this.id = id;
    this.code = code; // Course code like EDU101
    this.name = name;
    this.credits = credits;
    this.program = program; // B.Ed, M.Ed, FYUP, ITEP
    this.semester = semester;
    this.category = category; // major, minor, etc.
    this.type = type; // theory, practical, lab
    this.prerequisites = prerequisites || [];
    
    // Scheduling requirements
    this.hoursPerWeek = credits; // Generally 1 credit = 1 hour
    this.sessionsPerWeek = this.calculateSessionsPerWeek();
    this.duration = 60; // minutes per session
    
    // Resource requirements
    this.roomType = this.determineRoomType();
    this.capacity = 0; // Will be set based on enrolled students
    this.equipmentRequired = [];
    
    // Faculty requirements
    this.requiredFacultyQualification = [];
    this.preferredFaculty = [];
    
    // Special scheduling needs
    this.specialRequirements = {
      fixedTimeSlot: null, // If course must be at specific time
      blockedDays: [], // Days when course cannot be scheduled
      consecutiveSessions: false, // If sessions should be back-to-back
      labComponent: this.type === 'practical' || this.type === 'lab'
    };
  }
  
  calculateSessionsPerWeek() {
    // Standard: 1 credit = 1 hour per week
    // Can be split into multiple sessions
    if (this.credits <= 2) return 1;
    if (this.credits <= 4) return 2;
    return Math.ceil(this.credits / 2);
  }
  
  determineRoomType() {
    if (this.type === 'lab' || this.type === 'practical') {
      return 'laboratory';
    }
    if (this.credits >= 4 || this.name.includes('Seminar')) {
      return 'large_classroom';
    }
    return 'regular_classroom';
  }
}

// Room Data Model
class Room {
  constructor({
    id,
    name,
    building,
    floor,
    capacity,
    type,
    equipment
  }) {
    this.id = id;
    this.name = name;
    this.building = building;
    this.floor = floor;
    this.capacity = capacity;
    this.type = type; // regular_classroom, laboratory, seminar_hall, etc.
    this.equipment = equipment || [];
    
    // Availability tracking
    this.schedule = {
      monday: {},
      tuesday: {},
      wednesday: {},
      thursday: {},
      friday: {},
      saturday: {}
    };
    
    // Maintenance and restrictions
    this.maintenance = {
      scheduledMaintenance: [],
      unavailableDates: [],
      restrictions: [] // Any usage restrictions
    };
    
    // Features
    this.features = {
      airConditioning: false,
      projector: false,
      smartBoard: false,
      internet: false,
      audioSystem: false
    };
  }
  
  // Check if room is available at given time
  isAvailable(day, timeSlot) {
    return !this.schedule[day.toLowerCase()][timeSlot];
  }
  
  // Book the room
  bookRoom(day, timeSlot, courseId, facultyId) {
    if (this.isAvailable(day, timeSlot)) {
      this.schedule[day.toLowerCase()][timeSlot] = {
        courseId,
        facultyId,
        bookedAt: new Date()
      };
      return true;
    }
    return false;
  }
  
  // Check if room is suitable for course
  isSuitableFor(course) {
    // Check capacity, type, and equipment requirements
    return this.capacity >= course.capacity &&
           (this.type === course.roomType || this.type === 'multipurpose') &&
           course.equipmentRequired.every(eq => this.equipment.includes(eq));
  }
}

// Time Slot Model
class TimeSlot {
  constructor(startTime, endTime, label) {
    this.startTime = startTime; // "09:00"
    this.endTime = endTime;     // "10:00"
    this.label = label || `${startTime} - ${endTime}`;
    this.duration = this.calculateDuration();
  }
  
  calculateDuration() {
    const start = new Date(`2000-01-01T${this.startTime}:00`);
    const end = new Date(`2000-01-01T${this.endTime}:00`);
    return (end - start) / (1000 * 60); // Duration in minutes
  }
  
  // Check if this slot overlaps with another
  overlaps(otherSlot) {
    const thisStart = new Date(`2000-01-01T${this.startTime}:00`);
    const thisEnd = new Date(`2000-01-01T${this.endTime}:00`);
    const otherStart = new Date(`2000-01-01T${otherSlot.startTime}:00`);
    const otherEnd = new Date(`2000-01-01T${otherSlot.endTime}:00`);
    
    return thisStart < otherEnd && thisEnd > otherStart;
  }
}

// Timetable Entry Model
class TimetableEntry {
  constructor({
    id,
    courseId,
    facultyId,
    roomId,
    day,
    timeSlot,
    students,
    semester,
    academicYear
  }) {
    this.id = id;
    this.courseId = courseId;
    this.facultyId = facultyId;
    this.roomId = roomId;
    this.day = day;
    this.timeSlot = timeSlot;
    this.students = students || []; // Array of student IDs
    this.semester = semester;
    this.academicYear = academicYear;
    
    // Metadata
    this.createdAt = new Date();
    this.status = 'scheduled'; // scheduled, cancelled, rescheduled
    this.conflicts = []; // Any detected conflicts
    
    // Special sessions
    this.sessionType = 'regular'; // regular, makeup, extra, exam
    this.notes = '';
  }
  
  // Validate the timetable entry
  isValid() {
    return this.courseId && 
           this.facultyId && 
           this.roomId && 
           this.day && 
           this.timeSlot &&
           this.conflicts.length === 0;
  }
}

// Export all models
export {
  Student,
  Faculty,
  Course,
  Room,
  TimeSlot,
  TimetableEntry
};