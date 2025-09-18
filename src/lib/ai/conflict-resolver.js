/**
 * Advanced Conflict Detection and Resolution System
 * Handles all types of timetabling conflicts with intelligent resolution strategies
 */

import _ from 'lodash';

// Conflict types and severity levels
export const CONFLICT_TYPES = {
  FACULTY_DOUBLE_BOOKING: 'faculty_double_booking',
  ROOM_DOUBLE_BOOKING: 'room_double_booking',
  STUDENT_SCHEDULE_CLASH: 'student_schedule_clash',
  CAPACITY_OVERFLOW: 'capacity_overflow',
  PREREQUISITE_VIOLATION: 'prerequisite_violation',
  WORKLOAD_EXCEEDED: 'workload_exceeded',
  UNAVAILABLE_FACULTY: 'unavailable_faculty',
  UNSUITABLE_ROOM: 'unsuitable_room',
  TIME_CONSTRAINT_VIOLATION: 'time_constraint_violation',
  TEACHING_PRACTICE_CONFLICT: 'teaching_practice_conflict'
};

export const CONFLICT_SEVERITY = {
  CRITICAL: 5,    // Must be resolved
  HIGH: 4,        // Should be resolved
  MEDIUM: 3,      // Important to resolve
  LOW: 2,         // Nice to resolve
  INFO: 1         // Just information
};

/**
 * Comprehensive Conflict Detector
 */
class ConflictDetector {
  constructor(courses, faculty, rooms, timeSlots, students) {
    this.courses = courses;
    this.faculty = faculty;
    this.rooms = rooms;
    this.timeSlots = timeSlots;
    this.students = students;
  }

  /**
   * Detect all conflicts in a given timetable
   */
  detectAllConflicts(timetable) {
    const conflicts = [];

    // Group schedule entries by time for efficient conflict detection
    const timeSlotGroups = this.groupByTimeSlot(timetable);

    for (const [timeKey, entries] of Object.entries(timeSlotGroups)) {
      if (entries.length > 1) {
        // Multiple entries at same time - potential conflicts
        conflicts.push(...this.detectTimeSlotConflicts(entries, timeKey));
      }
    }

    // Detect other types of conflicts
    conflicts.push(...this.detectCapacityConflicts(timetable));
    conflicts.push(...this.detectWorkloadConflicts(timetable));
    conflicts.push(...this.detectPrerequisiteConflicts(timetable));
    conflicts.push(...this.detectAvailabilityConflicts(timetable));
    conflicts.push(...this.detectRoomSuitabilityConflicts(timetable));
    conflicts.push(...this.detectTeachingPracticeConflicts(timetable));

    // Sort by severity and return
    return conflicts.sort((a, b) => b.severity - a.severity);
  }

  /**
   * Group timetable entries by time slot for efficient processing
   */
  groupByTimeSlot(timetable) {
    return _.groupBy(timetable, entry => `${entry.day}-${entry.timeSlot}`);
  }

  /**
   * Detect conflicts within the same time slot
   */
  detectTimeSlotConflicts(entries, timeKey) {
    const conflicts = [];
    const [day, timeSlot] = timeKey.split('-');

    // Faculty conflicts
    const facultyGroups = _.groupBy(entries, 'facultyId');
    for (const [facultyId, facultyEntries] of Object.entries(facultyGroups)) {
      if (facultyEntries.length > 1 && facultyId !== 'unassigned') {
        conflicts.push({
          id: `faculty-${facultyId}-${timeKey}`,
          type: CONFLICT_TYPES.FACULTY_DOUBLE_BOOKING,
          severity: CONFLICT_SEVERITY.CRITICAL,
          description: `Faculty ${this.getFacultyName(facultyId)} is scheduled for multiple classes at ${timeSlot} on ${day}`,
          affectedEntries: facultyEntries,
          facultyId: facultyId,
          timeSlot: { day, timeSlot },
          resolutionStrategies: ['reschedule', 'reassign_faculty', 'split_class']
        });
      }
    }

    // Room conflicts
    const roomGroups = _.groupBy(entries, 'roomId');
    for (const [roomId, roomEntries] of Object.entries(roomGroups)) {
      if (roomEntries.length > 1 && roomId !== 'unassigned') {
        conflicts.push({
          id: `room-${roomId}-${timeKey}`,
          type: CONFLICT_TYPES.ROOM_DOUBLE_BOOKING,
          severity: CONFLICT_SEVERITY.CRITICAL,
          description: `Room ${this.getRoomName(roomId)} is booked for multiple classes at ${timeSlot} on ${day}`,
          affectedEntries: roomEntries,
          roomId: roomId,
          timeSlot: { day, timeSlot },
          resolutionStrategies: ['reschedule', 'reassign_room', 'find_alternate_room']
        });
      }
    }

    // Student conflicts
    const studentConflicts = this.detectStudentConflictsInTimeSlot(entries);
    conflicts.push(...studentConflicts);

    return conflicts;
  }

  /**
   * Detect student schedule conflicts within a time slot
   */
  detectStudentConflictsInTimeSlot(entries) {
    const conflicts = [];
    const studentSchedules = {};

    for (const entry of entries) {
      for (const studentId of entry.students || []) {
        if (studentSchedules[studentId]) {
          // Student has multiple classes at same time
          const conflict = {
            id: `student-${studentId}-${entry.day}-${entry.timeSlot}`,
            type: CONFLICT_TYPES.STUDENT_SCHEDULE_CLASH,
            severity: CONFLICT_SEVERITY.HIGH,
            description: `Student ${studentId} has multiple classes scheduled at the same time`,
            affectedEntries: [studentSchedules[studentId], entry],
            studentId: studentId,
            timeSlot: { day: entry.day, timeSlot: entry.timeSlot },
            resolutionStrategies: ['reschedule_one', 'allow_choice', 'priority_based']
          };
          conflicts.push(conflict);
        } else {
          studentSchedules[studentId] = entry;
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect room capacity violations
   */
  detectCapacityConflicts(timetable) {
    const conflicts = [];

    for (const entry of timetable) {
      if (entry.roomId === 'unassigned') continue;

      const room = this.rooms.find(r => r.id === entry.roomId);
      const studentCount = entry.students?.length || 0;

      if (room && studentCount > room.capacity) {
        conflicts.push({
          id: `capacity-${entry.id}`,
          type: CONFLICT_TYPES.CAPACITY_OVERFLOW,
          severity: CONFLICT_SEVERITY.HIGH,
          description: `Room ${room.name} capacity (${room.capacity}) exceeded by ${studentCount - room.capacity} students`,
          affectedEntries: [entry],
          roomId: room.id,
          requiredCapacity: studentCount,
          availableCapacity: room.capacity,
          overflow: studentCount - room.capacity,
          resolutionStrategies: ['find_larger_room', 'split_class', 'reduce_enrollment']
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect faculty workload violations
   */
  detectWorkloadConflicts(timetable) {
    const conflicts = [];
    const facultyWorkloads = {};

    // Calculate current workloads
    for (const entry of timetable) {
      if (entry.facultyId === 'unassigned') continue;

      if (!facultyWorkloads[entry.facultyId]) {
        facultyWorkloads[entry.facultyId] = {
          hours: 0,
          courses: 0,
          classes: []
        };
      }

      facultyWorkloads[entry.facultyId].hours += 1; // Assuming 1 hour per class
      facultyWorkloads[entry.facultyId].classes.push(entry);
    }

    // Count unique courses per faculty
    for (const [facultyId, workload] of Object.entries(facultyWorkloads)) {
      const uniqueCourses = new Set(workload.classes.map(c => c.courseId));
      workload.courses = uniqueCourses.size;
    }

    // Check against limits
    for (const faculty of this.faculty) {
      const workload = facultyWorkloads[faculty.id];
      if (!workload) continue;

      // Check hour limits
      if (workload.hours > faculty.workload.maxHoursPerWeek) {
        conflicts.push({
          id: `workload-hours-${faculty.id}`,
          type: CONFLICT_TYPES.WORKLOAD_EXCEEDED,
          severity: CONFLICT_SEVERITY.MEDIUM,
          description: `Faculty ${faculty.name} assigned ${workload.hours} hours, exceeds limit of ${faculty.workload.maxHoursPerWeek}`,
          facultyId: faculty.id,
          currentWorkload: workload.hours,
          maxWorkload: faculty.workload.maxHoursPerWeek,
          excess: workload.hours - faculty.workload.maxHoursPerWeek,
          affectedEntries: workload.classes,
          resolutionStrategies: ['redistribute_classes', 'hire_additional_faculty', 'increase_limit']
        });
      }

      // Check course limits
      if (workload.courses > faculty.workload.maxCoursesPerSemester) {
        conflicts.push({
          id: `workload-courses-${faculty.id}`,
          type: CONFLICT_TYPES.WORKLOAD_EXCEEDED,
          severity: CONFLICT_SEVERITY.MEDIUM,
          description: `Faculty ${faculty.name} assigned ${workload.courses} courses, exceeds limit of ${faculty.workload.maxCoursesPerSemester}`,
          facultyId: faculty.id,
          currentCourses: workload.courses,
          maxCourses: faculty.workload.maxCoursesPerSemester,
          excess: workload.courses - faculty.workload.maxCoursesPerSemester,
          affectedEntries: workload.classes,
          resolutionStrategies: ['reassign_courses', 'team_teaching', 'increase_limit']
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect prerequisite violations
   */
  detectPrerequisiteConflicts(timetable) {
    const conflicts = [];
    
    // This would require tracking student progress and course prerequisites
    // For now, we'll implement a basic version
    
    for (const entry of timetable) {
      const course = this.courses.find(c => c.id === entry.courseId);
      if (!course || !course.prerequisites?.length) continue;

      // Check if students have completed prerequisites
      for (const studentId of entry.students || []) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) continue;

        // Simple check: if student's semester is less than course semester
        if (student.semester < course.semester) {
          conflicts.push({
            id: `prerequisite-${studentId}-${course.id}`,
            type: CONFLICT_TYPES.PREREQUISITE_VIOLATION,
            severity: CONFLICT_SEVERITY.HIGH,
            description: `Student ${studentId} enrolled in ${course.name} but may not have completed prerequisites`,
            studentId: studentId,
            courseId: course.id,
            affectedEntries: [entry],
            resolutionStrategies: ['verify_prerequisites', 'allow_conditional', 'remove_student']
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect faculty availability conflicts
   */
  detectAvailabilityConflicts(timetable) {
    const conflicts = [];

    for (const entry of timetable) {
      if (entry.facultyId === 'unassigned') continue;

      const faculty = this.faculty.find(f => f.id === entry.facultyId);
      if (!faculty) continue;

      // Check if faculty is available at this time
      const dayAvailability = faculty.availability[entry.day.toLowerCase()];
      if (dayAvailability && !faculty.isAvailable(entry.day, entry.timeSlot)) {
        conflicts.push({
          id: `availability-${faculty.id}-${entry.day}-${entry.timeSlot}`,
          type: CONFLICT_TYPES.UNAVAILABLE_FACULTY,
          severity: CONFLICT_SEVERITY.HIGH,
          description: `Faculty ${faculty.name} is not available at ${entry.timeSlot} on ${entry.day}`,
          facultyId: faculty.id,
          timeSlot: { day: entry.day, timeSlot: entry.timeSlot },
          affectedEntries: [entry],
          resolutionStrategies: ['reschedule', 'reassign_faculty', 'update_availability']
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect room suitability conflicts
   */
  detectRoomSuitabilityConflicts(timetable) {
    const conflicts = [];

    for (const entry of timetable) {
      if (entry.roomId === 'unassigned') continue;

      const room = this.rooms.find(r => r.id === entry.roomId);
      const course = this.courses.find(c => c.id === entry.courseId);

      if (!room || !course) continue;

      // Check if room is suitable for course
      if (!room.isSuitableFor(course)) {
        conflicts.push({
          id: `suitability-${room.id}-${course.id}`,
          type: CONFLICT_TYPES.UNSUITABLE_ROOM,
          severity: CONFLICT_SEVERITY.MEDIUM,
          description: `Room ${room.name} is not suitable for course ${course.name}`,
          roomId: room.id,
          courseId: course.id,
          affectedEntries: [entry],
          reasons: this.getRoomUnsuitabilityReasons(room, course),
          resolutionStrategies: ['find_suitable_room', 'upgrade_room', 'modify_course_requirements']
        });
      }
    }

    return conflicts;
  }

  /**
   * Detect teaching practice scheduling conflicts
   */
  detectTeachingPracticeConflicts(timetable) {
    const conflicts = [];

    // Find teaching practice sessions
    const teachingPracticeSessions = timetable.filter(entry => {
      const course = this.courses.find(c => c.id === entry.courseId);
      return course && course.name.toLowerCase().includes('teaching practice');
    });

    for (const session of teachingPracticeSessions) {
      // Check if students have conflicting regular classes
      const conflictingClasses = timetable.filter(entry => {
        return entry.id !== session.id &&
               entry.day === session.day &&
               entry.timeSlot === session.timeSlot &&
               _.intersection(entry.students || [], session.students || []).length > 0;
      });

      if (conflictingClasses.length > 0) {
        conflicts.push({
          id: `teaching-practice-${session.id}`,
          type: CONFLICT_TYPES.TEACHING_PRACTICE_CONFLICT,
          severity: CONFLICT_SEVERITY.HIGH,
          description: `Teaching practice session conflicts with regular classes for some students`,
          affectedEntries: [session, ...conflictingClasses],
          resolutionStrategies: ['reschedule_practice', 'reschedule_classes', 'stagger_students']
        });
      }
    }

    return conflicts;
  }

  /**
   * Get reasons why a room is unsuitable for a course
   */
  getRoomUnsuitabilityReasons(room, course) {
    const reasons = [];

    if (room.capacity < (course.capacity || 0)) {
      reasons.push(`Insufficient capacity: room has ${room.capacity}, course needs ${course.capacity}`);
    }

    if (course.roomType && room.type !== course.roomType && room.type !== 'multipurpose') {
      reasons.push(`Wrong room type: room is ${room.type}, course needs ${course.roomType}`);
    }

    if (course.equipmentRequired) {
      const missingEquipment = course.equipmentRequired.filter(eq => !room.equipment.includes(eq));
      if (missingEquipment.length > 0) {
        reasons.push(`Missing equipment: ${missingEquipment.join(', ')}`);
      }
    }

    return reasons;
  }

  /**
   * Get faculty name by ID
   */
  getFacultyName(facultyId) {
    const faculty = this.faculty.find(f => f.id === facultyId);
    return faculty ? faculty.name : `Faculty ${facultyId}`;
  }

  /**
   * Get room name by ID
   */
  getRoomName(roomId) {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : `Room ${roomId}`;
  }
}

/**
 * Intelligent Conflict Resolution System
 */
class ConflictResolver {
  constructor(courses, faculty, rooms, timeSlots, students) {
    this.courses = courses;
    this.faculty = faculty;
    this.rooms = rooms;
    this.timeSlots = timeSlots;
    this.students = students;
    this.detector = new ConflictDetector(courses, faculty, rooms, timeSlots, students);
  }

  /**
   * Resolve conflicts in a timetable
   */
  async resolveConflicts(timetable, maxIterations = 100) {
    let currentTimetable = [...timetable];
    let iteration = 0;
    let resolvedConflicts = [];

    while (iteration < maxIterations) {
      const conflicts = this.detector.detectAllConflicts(currentTimetable);
      
      if (conflicts.length === 0) {
        console.log(`All conflicts resolved in ${iteration} iterations`);
        break;
      }

      // Sort conflicts by severity and try to resolve the most critical first
      const criticalConflicts = conflicts.filter(c => c.severity >= CONFLICT_SEVERITY.HIGH);
      
      if (criticalConflicts.length === 0) {
        console.log(`Only low-severity conflicts remain after ${iteration} iterations`);
        break;
      }

      let resolved = false;
      
      // Try to resolve the first critical conflict
      for (const conflict of criticalConflicts.slice(0, 3)) { // Try top 3
        const resolution = await this.resolveConflict(conflict, currentTimetable);
        
        if (resolution.success) {
          currentTimetable = resolution.newTimetable;
          resolvedConflicts.push({
            conflict: conflict,
            resolution: resolution.method,
            iteration: iteration
          });
          resolved = true;
          console.log(`Resolved ${conflict.type} using ${resolution.method}`);
          break;
        }
      }

      if (!resolved) {
        console.log(`Could not resolve conflicts after ${iteration} iterations`);
        break;
      }

      iteration++;
    }

    return {
      timetable: currentTimetable,
      resolvedConflicts: resolvedConflicts,
      remainingConflicts: this.detector.detectAllConflicts(currentTimetable),
      iterations: iteration
    };
  }

  /**
   * Resolve a specific conflict
   */
  async resolveConflict(conflict, timetable) {
    const strategies = conflict.resolutionStrategies || [];

    for (const strategy of strategies) {
      try {
        const result = await this.applyResolutionStrategy(strategy, conflict, timetable);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn(`Strategy ${strategy} failed:`, error.message);
      }
    }

    return { success: false, method: 'none' };
  }

  /**
   * Apply a specific resolution strategy
   */
  async applyResolutionStrategy(strategy, conflict, timetable) {
    switch (strategy) {
      case 'reschedule':
        return this.rescheduleEntry(conflict, timetable);
      
      case 'reassign_faculty':
        return this.reassignFaculty(conflict, timetable);
      
      case 'reassign_room':
      case 'find_alternate_room':
      case 'find_larger_room':
        return this.reassignRoom(conflict, timetable);
      
      case 'split_class':
        return this.splitClass(conflict, timetable);
      
      case 'reschedule_one':
        return this.rescheduleOneOfMultiple(conflict, timetable);
      
      default:
        return { success: false, method: strategy, reason: 'Strategy not implemented' };
    }
  }

  /**
   * Reschedule a conflicting entry to a different time
   */
  rescheduleEntry(conflict, timetable) {
    const affectedEntries = conflict.affectedEntries || [];
    if (affectedEntries.length === 0) return { success: false, method: 'reschedule' };

    // Try to reschedule the first affected entry
    const entryToReschedule = affectedEntries[0];
    const newTimetable = [...timetable];
    
    // Find alternative time slots
    const alternativeSlots = this.findAlternativeTimeSlots(entryToReschedule, newTimetable);
    
    if (alternativeSlots.length > 0) {
      const newSlot = alternativeSlots[0];
      const entryIndex = newTimetable.findIndex(e => e.id === entryToReschedule.id);
      
      if (entryIndex !== -1) {
        newTimetable[entryIndex] = {
          ...entryToReschedule,
          day: newSlot.day,
          timeSlot: newSlot.timeSlot,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime
        };

        return {
          success: true,
          method: 'reschedule',
          newTimetable: newTimetable,
          details: `Rescheduled to ${newSlot.day} ${newSlot.timeSlot}`
        };
      }
    }

    return { success: false, method: 'reschedule', reason: 'No alternative time slots found' };
  }

  /**
   * Reassign faculty for a conflicting entry
   */
  reassignFaculty(conflict, timetable) {
    const affectedEntries = conflict.affectedEntries || [];
    if (affectedEntries.length === 0) return { success: false, method: 'reassign_faculty' };

    const entryToReassign = affectedEntries[0];
    const course = this.courses.find(c => c.id === entryToReassign.courseId);
    
    if (!course) return { success: false, method: 'reassign_faculty' };

    // Find alternative faculty
    const alternativeFaculty = this.findAlternativeFaculty(course, entryToReassign, timetable);
    
    if (alternativeFaculty) {
      const newTimetable = [...timetable];
      const entryIndex = newTimetable.findIndex(e => e.id === entryToReassign.id);
      
      if (entryIndex !== -1) {
        newTimetable[entryIndex] = {
          ...entryToReassign,
          facultyId: alternativeFaculty.id,
          facultyName: alternativeFaculty.name
        };

        return {
          success: true,
          method: 'reassign_faculty',
          newTimetable: newTimetable,
          details: `Reassigned to ${alternativeFaculty.name}`
        };
      }
    }

    return { success: false, method: 'reassign_faculty', reason: 'No suitable alternative faculty found' };
  }

  /**
   * Reassign room for a conflicting entry
   */
  reassignRoom(conflict, timetable) {
    const affectedEntries = conflict.affectedEntries || [];
    if (affectedEntries.length === 0) return { success: false, method: 'reassign_room' };

    const entryToReassign = affectedEntries[0];
    const course = this.courses.find(c => c.id === entryToReassign.courseId);
    
    if (!course) return { success: false, method: 'reassign_room' };

    // Find alternative rooms
    const alternativeRooms = this.findAlternativeRooms(course, entryToReassign, timetable);
    
    if (alternativeRooms.length > 0) {
      const newRoom = alternativeRooms[0];
      const newTimetable = [...timetable];
      const entryIndex = newTimetable.findIndex(e => e.id === entryToReassign.id);
      
      if (entryIndex !== -1) {
        newTimetable[entryIndex] = {
          ...entryToReassign,
          roomId: newRoom.id,
          roomName: newRoom.name
        };

        return {
          success: true,
          method: 'reassign_room',
          newTimetable: newTimetable,
          details: `Reassigned to ${newRoom.name}`
        };
      }
    }

    return { success: false, method: 'reassign_room', reason: 'No suitable alternative rooms found' };
  }

  /**
   * Split a class into multiple sessions
   */
  splitClass(conflict, timetable) {
    // This is a complex operation that would require splitting students into groups
    // For now, return as not implemented
    return { 
      success: false, 
      method: 'split_class', 
      reason: 'Class splitting not yet implemented' 
    };
  }

  /**
   * Reschedule one of multiple conflicting entries
   */
  rescheduleOneOfMultiple(conflict, timetable) {
    const affectedEntries = conflict.affectedEntries || [];
    if (affectedEntries.length < 2) return { success: false, method: 'reschedule_one' };

    // Try rescheduling each entry until one succeeds
    for (let i = 1; i < affectedEntries.length; i++) {
      const entryToReschedule = affectedEntries[i];
      const alternativeSlots = this.findAlternativeTimeSlots(entryToReschedule, timetable);
      
      if (alternativeSlots.length > 0) {
        const newSlot = alternativeSlots[0];
        const newTimetable = [...timetable];
        const entryIndex = newTimetable.findIndex(e => e.id === entryToReschedule.id);
        
        if (entryIndex !== -1) {
          newTimetable[entryIndex] = {
            ...entryToReschedule,
            day: newSlot.day,
            timeSlot: newSlot.timeSlot,
            startTime: newSlot.startTime,
            endTime: newSlot.endTime
          };

          return {
            success: true,
            method: 'reschedule_one',
            newTimetable: newTimetable,
            details: `Rescheduled one conflicting entry to ${newSlot.day} ${newSlot.timeSlot}`
          };
        }
      }
    }

    return { success: false, method: 'reschedule_one', reason: 'Could not reschedule any conflicting entry' };
  }

  /**
   * Find alternative time slots for an entry
   */
  findAlternativeTimeSlots(entry, timetable, maxAlternatives = 5) {
    const alternatives = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const day of days) {
      for (const timeSlot of this.timeSlots) {
        if (day === entry.day && timeSlot.label === entry.timeSlot) {
          continue; // Skip current slot
        }

        // Check if this slot would create conflicts
        const wouldConflict = this.wouldCreateConflict(
          { ...entry, day, timeSlot: timeSlot.label, startTime: timeSlot.startTime, endTime: timeSlot.endTime },
          timetable
        );

        if (!wouldConflict) {
          alternatives.push({
            day,
            timeSlot: timeSlot.label,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime
          });

          if (alternatives.length >= maxAlternatives) {
            return alternatives;
          }
        }
      }
    }

    return alternatives;
  }

  /**
   * Find alternative faculty for a course
   */
  findAlternativeFaculty(course, entry, timetable) {
    return this.faculty.find(faculty => {
      // Must be different from current faculty
      if (faculty.id === entry.facultyId) return false;
      
      // Must be able to teach the course
      if (!faculty.canTeach(course)) return false;
      
      // Must be available at this time
      if (!faculty.isAvailable(entry.day, entry.timeSlot)) return false;
      
      // Must not have conflicts
      const wouldConflict = this.wouldCreateConflict(
        { ...entry, facultyId: faculty.id, facultyName: faculty.name },
        timetable
      );
      
      return !wouldConflict;
    });
  }

  /**
   * Find alternative rooms for a course
   */
  findAlternativeRooms(course, entry, timetable) {
    return this.rooms.filter(room => {
      // Must be different from current room
      if (room.id === entry.roomId) return false;
      
      // Must be suitable for the course
      if (!room.isSuitableFor(course)) return false;
      
      // Must not have conflicts
      const wouldConflict = this.wouldCreateConflict(
        { ...entry, roomId: room.id, roomName: room.name },
        timetable
      );
      
      return !wouldConflict;
    });
  }

  /**
   * Check if a modified entry would create conflicts
   */
  wouldCreateConflict(modifiedEntry, timetable) {
    // Create a temporary timetable with the modified entry
    const tempTimetable = timetable.map(entry => 
      entry.id === modifiedEntry.id ? modifiedEntry : entry
    );

    // Check for conflicts in this specific time slot
    const sameTimeEntries = tempTimetable.filter(entry =>
      entry.day === modifiedEntry.day && 
      entry.timeSlot === modifiedEntry.timeSlot &&
      entry.id !== modifiedEntry.id
    );

    // Faculty conflict
    if (sameTimeEntries.some(entry => entry.facultyId === modifiedEntry.facultyId && modifiedEntry.facultyId !== 'unassigned')) {
      return true;
    }

    // Room conflict
    if (sameTimeEntries.some(entry => entry.roomId === modifiedEntry.roomId && modifiedEntry.roomId !== 'unassigned')) {
      return true;
    }

    // Student conflict
    const modifiedStudents = modifiedEntry.students || [];
    for (const otherEntry of sameTimeEntries) {
      const otherStudents = otherEntry.students || [];
      if (_.intersection(modifiedStudents, otherStudents).length > 0) {
        return true;
      }
    }

    return false;
  }
}

export { ConflictDetector, ConflictResolver };