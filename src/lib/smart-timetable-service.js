/**
 * Main AI Timetable Service
 * Integrates genetic algorithm, conflict resolution, and NEP 2020 compliance
 */

import TimetableGeneticAlgorithm from './ai/genetic-algorithm.js';
import { ConflictDetector, ConflictResolver } from './ai/conflict-resolver.js';
import sampleDataGenerator from './data/sample-data.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Smart Timetable Generator Service
 * Main orchestrator for AI-based timetable generation
 */
export class SmartTimetableService {
  constructor() {
    this.isInitialized = false;
    this.data = null;
    this.conflictDetector = null;
    this.conflictResolver = null;
  }

  /**
   * Initialize the service with data
   */
  async initialize(customData = null) {
    console.log('Initializing Smart Timetable Service...');
    
    // Use provided data or generate sample data
    this.data = customData || sampleDataGenerator.getAllData();
    
    // Initialize AI components
    this.conflictDetector = new ConflictDetector(
      this.data.courses,
      this.data.faculty,
      this.data.rooms,
      this.data.timeSlots,
      this.data.students
    );
    
    this.conflictResolver = new ConflictResolver(
      this.data.courses,
      this.data.faculty,
      this.data.rooms,
      this.data.timeSlots,
      this.data.students
    );
    
    this.isInitialized = true;
    console.log('Smart Timetable Service initialized successfully');
    console.log('Data summary:', this.data.summary);
  }

  /**
   * Generate optimized timetable for a specific program and semester
   */
  async generateTimetable(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      program = 'B.Ed',
      semester = 1,
      optimizationLevel = 'high', // low, medium, high
      maxGenerations = 300,
      includeTeachingPractice = true,
      onProgress = null
    } = options;

    console.log(`Starting timetable generation for ${program} Semester ${semester}`);

    try {
      // Get relevant data for the program and semester
      const semesterData = this.getSemesterData(program, semester);
      
      if (semesterData.courses.length === 0) {
        throw new Error(`No courses found for ${program} Semester ${semester}`);
      }

      console.log(`Found ${semesterData.courses.length} courses and ${semesterData.students.length} students`);

      // Configure genetic algorithm based on optimization level
      const gaConfig = this.getGAConfig(optimizationLevel, maxGenerations);

      // Create and run genetic algorithm
      const ga = new TimetableGeneticAlgorithm(
        semesterData.courses,
        semesterData.faculty,
        semesterData.rooms,
        semesterData.timeSlots,
        semesterData.students,
        gaConfig
      );

      // Run evolution with progress tracking
      const progressCallback = (progress) => {
        console.log(`Generation ${progress.generation}: Fitness ${progress.bestFitness.toFixed(2)}, Conflicts: ${progress.conflicts}`);
        if (onProgress) {
          onProgress({
            ...progress,
            phase: 'evolution',
            program,
            semester
          });
        }
      };

      const bestSolution = await ga.evolve(progressCallback);

      // Post-process the solution
      console.log('Running conflict resolution...');
      if (onProgress) {
        onProgress({
          phase: 'conflict_resolution',
          program,
          semester,
          message: 'Resolving remaining conflicts...'
        });
      }

      const resolutionResult = await this.conflictResolver.resolveConflicts(
        bestSolution.schedule,
        50 // max iterations
      );

      // Generate final result
      const result = {
        id: uuidv4(),
        program,
        semester,
        generatedAt: new Date(),
        schedule: resolutionResult.timetable,
        optimization: {
          generations: ga.generation,
          finalFitness: bestSolution.fitness,
          evolutionTime: Date.now(),
          conflicts: {
            initial: bestSolution.conflicts.length,
            resolved: resolutionResult.resolvedConflicts.length,
            remaining: resolutionResult.remainingConflicts.length,
            details: resolutionResult.remainingConflicts
          }
        },
        metrics: {
          ...bestSolution.metrics,
          totalClasses: resolutionResult.timetable.length,
          facultyUtilization: this.calculateFacultyUtilization(resolutionResult.timetable, semesterData.faculty),
          roomUtilization: this.calculateRoomUtilization(resolutionResult.timetable, semesterData.rooms),
          studentSatisfaction: this.calculateStudentSatisfaction(resolutionResult.timetable, semesterData.students)
        },
        summary: this.generateTimetableSummary(resolutionResult.timetable, semesterData),
        qualityScore: this.calculateQualityScore(bestSolution.fitness, resolutionResult.remainingConflicts.length)
      };

      console.log(`Timetable generation completed!`);
      console.log(`Quality Score: ${result.qualityScore}/100`);
      console.log(`Remaining conflicts: ${result.optimization.conflicts.remaining}`);

      return result;

    } catch (error) {
      console.error('Error generating timetable:', error);
      throw new Error(`Timetable generation failed: ${error.message}`);
    }
  }

  /**
   * Generate timetable for multiple programs simultaneously
   */
  async generateMultiProgramTimetable(programs, options = {}) {
    const results = [];
    
    for (const programConfig of programs) {
      const { program, semesters } = programConfig;
      
      for (const semester of semesters) {
        const result = await this.generateTimetable({
          ...options,
          program,
          semester
        });
        results.push(result);
      }
    }

    return {
      id: uuidv4(),
      generatedAt: new Date(),
      programs: results,
      summary: this.generateMultiProgramSummary(results)
    };
  }

  /**
   * Validate and optimize existing timetable
   */
  async optimizeExistingTimetable(timetable, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('Analyzing existing timetable...');

    // Detect conflicts in existing timetable
    const conflicts = this.conflictDetector.detectAllConflicts(timetable);
    
    if (conflicts.length === 0) {
      return {
        status: 'optimal',
        message: 'Timetable is already conflict-free',
        timetable: timetable,
        conflicts: []
      };
    }

    console.log(`Found ${conflicts.length} conflicts, attempting resolution...`);

    // Resolve conflicts
    const resolutionResult = await this.conflictResolver.resolveConflicts(timetable);

    return {
      status: resolutionResult.remainingConflicts.length === 0 ? 'optimized' : 'partially_optimized',
      message: `Resolved ${resolutionResult.resolvedConflicts.length} conflicts`,
      timetable: resolutionResult.timetable,
      conflicts: resolutionResult.remainingConflicts,
      resolutionDetails: resolutionResult.resolvedConflicts
    };
  }

  /**
   * Get semester-specific data
   */
  getSemesterData(program, semester) {
    return {
      courses: this.data.courses.filter(c => c.program === program && c.semester === semester),
      students: this.data.students.filter(s => s.program === program && s.semester === semester),
      faculty: this.data.faculty.filter(f => f.programs.includes(program)),
      rooms: this.data.rooms,
      timeSlots: this.data.timeSlots
    };
  }

  /**
   * Get genetic algorithm configuration based on optimization level
   */
  getGAConfig(level, maxGenerations) {
    const configs = {
      low: {
        populationSize: 50,
        generations: Math.min(100, maxGenerations),
        mutationRate: 0.15,
        crossoverRate: 0.7,
        eliteSize: 5,
        convergenceThreshold: 30
      },
      medium: {
        populationSize: 75,
        generations: Math.min(200, maxGenerations),
        mutationRate: 0.1,
        crossoverRate: 0.8,
        eliteSize: 8,
        convergenceThreshold: 40
      },
      high: {
        populationSize: 100,
        generations: maxGenerations,
        mutationRate: 0.08,
        crossoverRate: 0.85,
        eliteSize: 10,
        convergenceThreshold: 50
      }
    };

    return configs[level] || configs.medium;
  }

  /**
   * Calculate faculty utilization percentage
   */
  calculateFacultyUtilization(timetable, faculty) {
    const facultyHours = {};
    
    // Count hours for each faculty
    timetable.forEach(entry => {
      if (entry.facultyId && entry.facultyId !== 'unassigned') {
        facultyHours[entry.facultyId] = (facultyHours[entry.facultyId] || 0) + 1;
      }
    });

    let totalPossibleHours = 0;
    let totalUsedHours = 0;

    faculty.forEach(f => {
      totalPossibleHours += f.workload.maxHoursPerWeek;
      totalUsedHours += facultyHours[f.id] || 0;
    });

    return totalPossibleHours > 0 ? (totalUsedHours / totalPossibleHours) * 100 : 0;
  }

  /**
   * Calculate room utilization percentage
   */
  calculateRoomUtilization(timetable, rooms) {
    const roomUsage = {};
    
    // Count usage for each room
    timetable.forEach(entry => {
      if (entry.roomId && entry.roomId !== 'unassigned') {
        const key = `${entry.roomId}-${entry.day}-${entry.timeSlot}`;
        roomUsage[key] = true;
      }
    });

    const totalTimeSlots = this.data.timeSlots.length * 6; // 6 days
    const totalRoomSlots = rooms.length * totalTimeSlots;
    const usedSlots = Object.keys(roomUsage).length;

    return totalRoomSlots > 0 ? (usedSlots / totalRoomSlots) * 100 : 0;
  }

  /**
   * Calculate student satisfaction score
   */
  calculateStudentSatisfaction(timetable, students) {
    // This would be based on various factors like:
    // - No schedule conflicts
    // - Reasonable gaps between classes
    // - Preferred time slots (if any)
    // For now, return a basic score based on conflict-free scheduling
    
    let totalStudentSlots = 0;
    let conflictFreeSlots = 0;

    students.forEach(student => {
      const studentSchedule = timetable.filter(entry => 
        entry.students && entry.students.includes(student.id)
      );

      totalStudentSlots += studentSchedule.length;

      // Check for time conflicts for this student
      const timeSlotCount = {};
      studentSchedule.forEach(entry => {
        const key = `${entry.day}-${entry.timeSlot}`;
        timeSlotCount[key] = (timeSlotCount[key] || 0) + 1;
      });

      // Count conflict-free slots
      Object.values(timeSlotCount).forEach(count => {
        if (count === 1) conflictFreeSlots++;
      });
    });

    return totalStudentSlots > 0 ? (conflictFreeSlots / totalStudentSlots) * 100 : 100;
  }

  /**
   * Generate timetable summary
   */
  generateTimetableSummary(timetable, data) {
    const summary = {
      totalClasses: timetable.length,
      courseDistribution: {},
      dayDistribution: {},
      timeSlotDistribution: {},
      facultyAssignment: {},
      roomAssignment: {}
    };

    timetable.forEach(entry => {
      // Course distribution
      const courseId = entry.courseId;
      summary.courseDistribution[courseId] = (summary.courseDistribution[courseId] || 0) + 1;

      // Day distribution
      summary.dayDistribution[entry.day] = (summary.dayDistribution[entry.day] || 0) + 1;

      // Time slot distribution
      summary.timeSlotDistribution[entry.timeSlot] = (summary.timeSlotDistribution[entry.timeSlot] || 0) + 1;

      // Faculty assignment
      if (entry.facultyId !== 'unassigned') {
        summary.facultyAssignment[entry.facultyId] = (summary.facultyAssignment[entry.facultyId] || 0) + 1;
      }

      // Room assignment
      if (entry.roomId !== 'unassigned') {
        summary.roomAssignment[entry.roomId] = (summary.roomAssignment[entry.roomId] || 0) + 1;
      }
    });

    return summary;
  }

  /**
   * Generate multi-program summary
   */
  generateMultiProgramSummary(results) {
    return {
      totalPrograms: results.length,
      totalClasses: results.reduce((sum, r) => sum + r.schedule.length, 0),
      averageQualityScore: results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
      totalConflicts: results.reduce((sum, r) => sum + r.optimization.conflicts.remaining, 0),
      programBreakdown: results.map(r => ({
        program: r.program,
        semester: r.semester,
        classes: r.schedule.length,
        qualityScore: r.qualityScore
      }))
    };
  }

  /**
   * Calculate overall quality score
   */
  calculateQualityScore(fitness, remainingConflicts) {
    // Base score from fitness (normalized to 0-80 range)
    const fitnessScore = Math.min(80, (fitness / 10000) * 80);
    
    // Deduct points for remaining conflicts
    const conflictPenalty = remainingConflicts * 5;
    
    // Quality bonus for high fitness
    const qualityBonus = fitness > 8000 ? 20 : fitness > 6000 ? 10 : 0;
    
    const finalScore = Math.max(0, Math.min(100, fitnessScore + qualityBonus - conflictPenalty));
    
    return Math.round(finalScore);
  }

  /**
   * Get available programs and semesters
   */
  getAvailablePrograms() {
    const programSemesters = {};
    
    this.data.courses.forEach(course => {
      if (!programSemesters[course.program]) {
        programSemesters[course.program] = new Set();
      }
      programSemesters[course.program].add(course.semester);
    });

    // Convert sets to sorted arrays
    Object.keys(programSemesters).forEach(program => {
      programSemesters[program] = Array.from(programSemesters[program]).sort((a, b) => a - b);
    });

    return programSemesters;
  }

  /**
   * Get system statistics
   */
  getSystemStats() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      ...this.data.summary,
      availablePrograms: this.getAvailablePrograms(),
      systemCapacity: {
        maxSimultaneousClasses: this.data.rooms.length,
        totalWeeklySlots: this.data.timeSlots.length * 6,
        maxStudentsPerSlot: this.data.rooms.reduce((max, room) => Math.max(max, room.capacity), 0)
      }
    };
  }
}

// Export singleton instance
const smartTimetableService = new SmartTimetableService();
export default smartTimetableService;