/**
 * Genetic Algorithm for AI-Based Timetable Generation
 * Implements constraint satisfaction and optimization for NEP 2020 compliance
 */

import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

// Genetic Algorithm Parameters
const GA_CONFIG = {
  populationSize: 100,
  generations: 500,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  eliteSize: 10,
  tournamentSize: 5,
  convergenceThreshold: 50 // Stop if no improvement for 50 generations
};

// Fitness weights for different constraints
const FITNESS_WEIGHTS = {
  hardConstraints: {
    noConflicts: 1000,        // No faculty/room double booking
    studentConflicts: 800,    // No student schedule conflicts
    prerequisiteViolation: 900, // Prerequisites must be met
    capacityViolation: 700,   // Room capacity constraints
  },
  softConstraints: {
    facultyPreferences: 100,  // Faculty time preferences
    roomPreferences: 80,      // Preferred room assignments
    workloadBalance: 150,     // Even distribution of workload
    consecutiveClasses: 60,   // Minimize gaps between classes
    dayDistribution: 90,      // Even distribution across days
  }
};

/**
 * Individual chromosome representing a complete timetable
 */
class TimetableChromosome {
  constructor(courses, faculty, rooms, timeSlots, students) {
    this.id = uuidv4();
    this.courses = courses;
    this.faculty = faculty;
    this.rooms = rooms;
    this.timeSlots = timeSlots;
    this.students = students;
    
    // The actual timetable - array of scheduled classes
    this.schedule = [];
    this.fitness = 0;
    this.conflicts = [];
    
    // Performance metrics
    this.metrics = {
      hardConstraintViolations: 0,
      softConstraintViolations: 0,
      facultyUtilization: 0,
      roomUtilization: 0,
      studentSatisfaction: 0
    };
  }
  
  // Generate random initial timetable
  generateRandom() {
    this.schedule = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (const course of this.courses) {
      const sessionsNeeded = course.sessionsPerWeek;
      
      for (let session = 0; session < sessionsNeeded; session++) {
        // Try to schedule this session
        let attempts = 0;
        let scheduled = false;
        
        while (!scheduled && attempts < 50) {
          const day = this.getRandomElement(days);
          const timeSlot = this.getRandomElement(this.timeSlots);
          const room = this.findSuitableRoom(course);
          const facultyMember = this.findSuitableFaculty(course);
          
          if (room && facultyMember) {
            const scheduleEntry = {
              id: uuidv4(),
              courseId: course.id,
              courseName: course.name,
              facultyId: facultyMember.id,
              facultyName: facultyMember.name,
              roomId: room.id,
              roomName: room.name,
              day: day,
              timeSlot: timeSlot.label,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
              students: this.getEnrolledStudents(course),
              sessionNumber: session + 1,
              totalSessions: sessionsNeeded
            };
            
            // Check for basic conflicts before adding
            if (!this.hasBasicConflicts(scheduleEntry)) {
              this.schedule.push(scheduleEntry);
              scheduled = true;
            }
          }
          attempts++;
        }
        
        // If couldn't schedule after many attempts, add anyway (will be penalized in fitness)
        if (!scheduled) {
          const scheduleEntry = {
            id: uuidv4(),
            courseId: course.id,
            courseName: course.name,
            facultyId: 'unassigned',
            facultyName: 'Unassigned',
            roomId: 'unassigned',
            roomName: 'Unassigned',
            day: this.getRandomElement(days),
            timeSlot: this.getRandomElement(this.timeSlots).label,
            startTime: this.getRandomElement(this.timeSlots).startTime,
            endTime: this.getRandomElement(this.timeSlots).endTime,
            students: this.getEnrolledStudents(course),
            sessionNumber: session + 1,
            totalSessions: sessionsNeeded,
            conflict: 'unscheduled'
          };
          this.schedule.push(scheduleEntry);
        }
      }
    }
    
    return this;
  }
  
  // Check for basic scheduling conflicts
  hasBasicConflicts(newEntry) {
    return this.schedule.some(existing => {
      // Same time slot conflicts
      if (existing.day === newEntry.day && existing.timeSlot === newEntry.timeSlot) {
        // Faculty conflict
        if (existing.facultyId === newEntry.facultyId) return true;
        // Room conflict
        if (existing.roomId === newEntry.roomId) return true;
        // Student conflict (check if any students overlap)
        if (_.intersection(existing.students, newEntry.students).length > 0) return true;
      }
      return false;
    });
  }
  
  // Find suitable room for course
  findSuitableRoom(course) {
    const suitableRooms = this.rooms.filter(room => room.isSuitableFor(course));
    return this.getRandomElement(suitableRooms);
  }
  
  // Find suitable faculty for course
  findSuitableFaculty(course) {
    const suitableFaculty = this.faculty.filter(f => f.canTeach(course));
    return this.getRandomElement(suitableFaculty);
  }
  
  // Get students enrolled in course
  getEnrolledStudents(course) {
    return this.students
      .filter(student => {
        // Check if student's program matches course program
        if (student.program !== course.program) return false;
        
        // Check if student's semester matches or is eligible
        const semesterDiff = student.semester - course.semester;
        return semesterDiff >= 0 && semesterDiff <= 1; // Can take current or previous semester courses
      })
      .map(student => student.id);
  }
  
  // Utility function to get random element
  getRandomElement(array) {
    return array.length > 0 ? array[Math.floor(Math.random() * array.length)] : null;
  }
  
  // Calculate fitness score
  calculateFitness() {
    this.conflicts = [];
    this.metrics = {
      hardConstraintViolations: 0,
      softConstraintViolations: 0,
      facultyUtilization: 0,
      roomUtilization: 0,
      studentSatisfaction: 0
    };
    
    let fitness = 10000; // Start with perfect score
    
    // Hard Constraints
    fitness -= this.checkFacultyConflicts() * FITNESS_WEIGHTS.hardConstraints.noConflicts;
    fitness -= this.checkRoomConflicts() * FITNESS_WEIGHTS.hardConstraints.noConflicts;
    fitness -= this.checkStudentConflicts() * FITNESS_WEIGHTS.hardConstraints.studentConflicts;
    fitness -= this.checkCapacityViolations() * FITNESS_WEIGHTS.hardConstraints.capacityViolation;
    
    // Soft Constraints
    fitness -= this.checkFacultyPreferences() * FITNESS_WEIGHTS.softConstraints.facultyPreferences;
    fitness -= this.checkWorkloadBalance() * FITNESS_WEIGHTS.softConstraints.workloadBalance;
    fitness -= this.checkDayDistribution() * FITNESS_WEIGHTS.softConstraints.dayDistribution;
    
    // Bonus for well-utilized resources
    fitness += this.calculateUtilizationBonus();
    
    this.fitness = Math.max(0, fitness); // Ensure non-negative
    return this.fitness;
  }
  
  // Check faculty double-booking conflicts
  checkFacultyConflicts() {
    const conflicts = [];
    const facultySchedule = {};
    
    for (const entry of this.schedule) {
      if (entry.facultyId === 'unassigned') {
        conflicts.push({ type: 'unassigned_faculty', entry });
        continue;
      }
      
      const key = `${entry.facultyId}-${entry.day}-${entry.timeSlot}`;
      
      if (facultySchedule[key]) {
        conflicts.push({
          type: 'faculty_conflict',
          faculty: entry.facultyId,
          conflictingEntries: [facultySchedule[key], entry]
        });
      } else {
        facultySchedule[key] = entry;
      }
    }
    
    this.conflicts.push(...conflicts);
    this.metrics.hardConstraintViolations += conflicts.length;
    return conflicts.length;
  }
  
  // Check room double-booking conflicts
  checkRoomConflicts() {
    const conflicts = [];
    const roomSchedule = {};
    
    for (const entry of this.schedule) {
      if (entry.roomId === 'unassigned') {
        conflicts.push({ type: 'unassigned_room', entry });
        continue;
      }
      
      const key = `${entry.roomId}-${entry.day}-${entry.timeSlot}`;
      
      if (roomSchedule[key]) {
        conflicts.push({
          type: 'room_conflict',
          room: entry.roomId,
          conflictingEntries: [roomSchedule[key], entry]
        });
      } else {
        roomSchedule[key] = entry;
      }
    }
    
    this.conflicts.push(...conflicts);
    this.metrics.hardConstraintViolations += conflicts.length;
    return conflicts.length;
  }
  
  // Check student schedule conflicts
  checkStudentConflicts() {
    const conflicts = [];
    const studentSchedules = {};
    
    for (const entry of this.schedule) {
      for (const studentId of entry.students) {
        const key = `${studentId}-${entry.day}-${entry.timeSlot}`;
        
        if (studentSchedules[key]) {
          conflicts.push({
            type: 'student_conflict',
            student: studentId,
            conflictingEntries: [studentSchedules[key], entry]
          });
        } else {
          studentSchedules[key] = entry;
        }
      }
    }
    
    this.conflicts.push(...conflicts);
    this.metrics.hardConstraintViolations += conflicts.length;
    return conflicts.length;
  }
  
  // Check room capacity violations
  checkCapacityViolations() {
    const violations = [];
    
    for (const entry of this.schedule) {
      if (entry.roomId === 'unassigned') continue;
      
      const room = this.rooms.find(r => r.id === entry.roomId);
      if (room && entry.students.length > room.capacity) {
        violations.push({
          type: 'capacity_violation',
          entry,
          required: entry.students.length,
          available: room.capacity
        });
      }
    }
    
    this.conflicts.push(...violations);
    this.metrics.hardConstraintViolations += violations.length;
    return violations.length;
  }
  
  // Check faculty preferences (soft constraint)
  checkFacultyPreferences() {
    let violations = 0;
    
    for (const entry of this.schedule) {
      if (entry.facultyId === 'unassigned') continue;
      
      const faculty = this.faculty.find(f => f.id === entry.facultyId);
      if (faculty) {
        // Check time preferences
        if (faculty.preferences.preferredTimeSlots.length > 0) {
          if (!faculty.preferences.preferredTimeSlots.includes(entry.timeSlot)) {
            violations++;
          }
        }
        
        // Check day preferences (avoid certain days)
        if (faculty.preferences.avoidBackToBack) {
          // Check for back-to-back classes
          const sameDay = this.schedule.filter(e => 
            e.facultyId === entry.facultyId && e.day === entry.day && e.id !== entry.id
          );
          if (sameDay.length > 0) {
            violations += 0.5; // Partial penalty
          }
        }
      }
    }
    
    this.metrics.softConstraintViolations += violations;
    return violations;
  }
  
  // Check workload balance (soft constraint)
  checkWorkloadBalance() {
    let imbalance = 0;
    const facultyWorkloads = {};
    
    // Calculate actual workloads
    for (const entry of this.schedule) {
      if (entry.facultyId === 'unassigned') continue;
      
      if (!facultyWorkloads[entry.facultyId]) {
        facultyWorkloads[entry.facultyId] = 0;
      }
      facultyWorkloads[entry.facultyId]++;
    }
    
    // Check against preferred workloads
    for (const faculty of this.faculty) {
      const actualWorkload = facultyWorkloads[faculty.id] || 0;
      const maxWorkload = faculty.workload.maxHoursPerWeek;
      
      if (actualWorkload > maxWorkload) {
        imbalance += (actualWorkload - maxWorkload) * 2; // Heavy penalty for overload
      }
      
      // Calculate utilization
      faculty.workload.currentHours = actualWorkload;
    }
    
    this.metrics.softConstraintViolations += imbalance;
    return imbalance;
  }
  
  // Check day distribution (soft constraint)
  checkDayDistribution() {
    let imbalance = 0;
    const dayDistribution = {};
    
    for (const entry of this.schedule) {
      dayDistribution[entry.day] = (dayDistribution[entry.day] || 0) + 1;
    }
    
    const days = Object.keys(dayDistribution);
    if (days.length > 0) {
      const avgPerDay = this.schedule.length / days.length;
      
      for (const day of days) {
        const deviation = Math.abs(dayDistribution[day] - avgPerDay);
        imbalance += deviation * 0.1;
      }
    }
    
    this.metrics.softConstraintViolations += imbalance;
    return imbalance;
  }
  
  // Calculate utilization bonus
  calculateUtilizationBonus() {
    let bonus = 0;
    
    // Faculty utilization bonus
    const facultyUtilization = this.calculateFacultyUtilization();
    if (facultyUtilization > 0.7 && facultyUtilization < 0.9) {
      bonus += 100; // Optimal utilization range
    }
    
    // Room utilization bonus
    const roomUtilization = this.calculateRoomUtilization();
    if (roomUtilization > 0.6 && roomUtilization < 0.8) {
      bonus += 50;
    }
    
    this.metrics.facultyUtilization = facultyUtilization;
    this.metrics.roomUtilization = roomUtilization;
    
    return bonus;
  }
  
  calculateFacultyUtilization() {
    let totalPossibleHours = 0;
    let totalUsedHours = 0;
    
    for (const faculty of this.faculty) {
      totalPossibleHours += faculty.workload.maxHoursPerWeek;
      totalUsedHours += faculty.workload.currentHours;
    }
    
    return totalPossibleHours > 0 ? totalUsedHours / totalPossibleHours : 0;
  }
  
  calculateRoomUtilization() {
    const totalSlots = this.timeSlots.length * 6; // 6 days
    const usedSlots = new Set();
    
    for (const entry of this.schedule) {
      if (entry.roomId !== 'unassigned') {
        usedSlots.add(`${entry.roomId}-${entry.day}-${entry.timeSlot}`);
      }
    }
    
    const totalRoomSlots = this.rooms.length * totalSlots;
    return totalRoomSlots > 0 ? usedSlots.size / totalRoomSlots : 0;
  }
  
  // Genetic operations
  crossover(other) {
    // Single-point crossover
    const crossoverPoint = Math.floor(Math.random() * this.schedule.length);
    
    const offspring1 = new TimetableChromosome(this.courses, this.faculty, this.rooms, this.timeSlots, this.students);
    const offspring2 = new TimetableChromosome(this.courses, this.faculty, this.rooms, this.timeSlots, this.students);
    
    offspring1.schedule = [
      ...this.schedule.slice(0, crossoverPoint),
      ...other.schedule.slice(crossoverPoint)
    ];
    
    offspring2.schedule = [
      ...other.schedule.slice(0, crossoverPoint),
      ...this.schedule.slice(crossoverPoint)
    ];
    
    return [offspring1, offspring2];
  }
  
  mutate() {
    if (Math.random() < GA_CONFIG.mutationRate) {
      // Random mutation: change one schedule entry
      if (this.schedule.length > 0) {
        const randomIndex = Math.floor(Math.random() * this.schedule.length);
        const entry = this.schedule[randomIndex];
        
        // Mutate one aspect of the entry
        const mutationType = Math.random();
        
        if (mutationType < 0.25) {
          // Change day
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          entry.day = this.getRandomElement(days);
        } else if (mutationType < 0.5) {
          // Change time slot
          const newTimeSlot = this.getRandomElement(this.timeSlots);
          entry.timeSlot = newTimeSlot.label;
          entry.startTime = newTimeSlot.startTime;
          entry.endTime = newTimeSlot.endTime;
        } else if (mutationType < 0.75) {
          // Change room
          const course = this.courses.find(c => c.id === entry.courseId);
          if (course) {
            const newRoom = this.findSuitableRoom(course);
            if (newRoom) {
              entry.roomId = newRoom.id;
              entry.roomName = newRoom.name;
            }
          }
        } else {
          // Change faculty
          const course = this.courses.find(c => c.id === entry.courseId);
          if (course) {
            const newFaculty = this.findSuitableFaculty(course);
            if (newFaculty) {
              entry.facultyId = newFaculty.id;
              entry.facultyName = newFaculty.name;
            }
          }
        }
      }
    }
  }
  
  // Create a deep copy
  clone() {
    const clone = new TimetableChromosome(this.courses, this.faculty, this.rooms, this.timeSlots, this.students);
    clone.schedule = JSON.parse(JSON.stringify(this.schedule));
    clone.fitness = this.fitness;
    clone.conflicts = [...this.conflicts];
    clone.metrics = { ...this.metrics };
    return clone;
  }
}

/**
 * Genetic Algorithm Engine for Timetable Optimization
 */
class TimetableGeneticAlgorithm {
  constructor(courses, faculty, rooms, timeSlots, students, config = {}) {
    this.courses = courses;
    this.faculty = faculty;
    this.rooms = rooms;
    this.timeSlots = timeSlots;
    this.students = students;
    this.config = { ...GA_CONFIG, ...config };
    
    this.population = [];
    this.generation = 0;
    this.bestFitness = 0;
    this.bestSolution = null;
    this.fitnessHistory = [];
    this.stagnationCounter = 0;
  }
  
  // Initialize population
  initializePopulation() {
    this.population = [];
    
    for (let i = 0; i < this.config.populationSize; i++) {
      const chromosome = new TimetableChromosome(
        this.courses, this.faculty, this.rooms, this.timeSlots, this.students
      );
      chromosome.generateRandom();
      chromosome.calculateFitness();
      this.population.push(chromosome);
    }
    
    // Sort by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);
    this.bestSolution = this.population[0].clone();
    this.bestFitness = this.bestSolution.fitness;
    
    console.log(`Initial population created. Best fitness: ${this.bestFitness}`);
  }
  
  // Run the genetic algorithm
  async evolve(onProgress = null) {
    this.initializePopulation();
    
    for (this.generation = 1; this.generation <= this.config.generations; this.generation++) {
      // Selection and reproduction
      const newPopulation = [];
      
      // Elitism: keep best individuals
      for (let i = 0; i < this.config.eliteSize; i++) {
        newPopulation.push(this.population[i].clone());
      }
      
      // Generate offspring
      while (newPopulation.length < this.config.populationSize) {
        const parent1 = this.tournamentSelection();
        const parent2 = this.tournamentSelection();
        
        if (Math.random() < this.config.crossoverRate) {
          const [offspring1, offspring2] = parent1.crossover(parent2);
          
          offspring1.mutate();
          offspring2.mutate();
          
          offspring1.calculateFitness();
          offspring2.calculateFitness();
          
          if (newPopulation.length < this.config.populationSize) {
            newPopulation.push(offspring1);
          }
          if (newPopulation.length < this.config.populationSize) {
            newPopulation.push(offspring2);
          }
        } else {
          const offspring = parent1.clone();
          offspring.mutate();
          offspring.calculateFitness();
          newPopulation.push(offspring);
        }
      }
      
      // Replace population
      this.population = newPopulation;
      this.population.sort((a, b) => b.fitness - a.fitness);
      
      // Update best solution
      if (this.population[0].fitness > this.bestFitness) {
        this.bestSolution = this.population[0].clone();
        this.bestFitness = this.bestSolution.fitness;
        this.stagnationCounter = 0;
        console.log(`Generation ${this.generation}: New best fitness ${this.bestFitness}`);
      } else {
        this.stagnationCounter++;
      }
      
      this.fitnessHistory.push(this.bestFitness);
      
      // Call progress callback
      if (onProgress) {
        onProgress({
          generation: this.generation,
          bestFitness: this.bestFitness,
          avgFitness: this.population.reduce((sum, chr) => sum + chr.fitness, 0) / this.population.length,
          conflicts: this.bestSolution.conflicts.length,
          stagnation: this.stagnationCounter
        });
      }
      
      // Check for convergence
      if (this.stagnationCounter >= this.config.convergenceThreshold) {
        console.log(`Converged at generation ${this.generation} after ${this.stagnationCounter} generations without improvement`);
        break;
      }
      
      // Allow UI to update
      if (this.generation % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    console.log(`Evolution completed. Best fitness: ${this.bestFitness}`);
    return this.bestSolution;
  }
  
  // Tournament selection
  tournamentSelection() {
    const tournament = [];
    
    for (let i = 0; i < this.config.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }
    
    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }
  
  // Get optimization results
  getResults() {
    return {
      bestTimetable: this.bestSolution,
      fitness: this.bestFitness,
      generations: this.generation,
      conflicts: this.bestSolution?.conflicts || [],
      metrics: this.bestSolution?.metrics || {},
      fitnessHistory: this.fitnessHistory,
      schedule: this.bestSolution?.schedule || []
    };
  }
}

export default TimetableGeneticAlgorithm;