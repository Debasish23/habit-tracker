import Int "mo:core/Int";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  type HabitId = Int;
  type Date = Int; // Unix timestamp (seconds since 1970-01-01)
  type Execution = Date;

  type Habit = {
    id : HabitId;
    name : Text;
    created : Date;
    executions : [Execution];
  };

  public type UserProfile = {
    name : Text;
  };

  type HabitView = {
    id : HabitId;
    name : Text;
    created : Date;
    executions : [Execution];
  };

  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Map Principal -> (HabitId -> Habit)
  let userHabits = Map.empty<Principal, Map.Map<HabitId, Habit>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextHabitId : HabitId = 0;

  func getHabitsForCaller(caller : Principal) : Map.Map<HabitId, Habit> {
    switch (userHabits.get(caller)) {
      case (null) { Map.empty<HabitId, Habit>() };
      case (?habits) { habits };
    };
  };

  func saveHabitsForCaller(caller : Principal, habits : Map.Map<HabitId, Habit>) {
    userHabits.add(caller, habits);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Habit Management
  public shared ({ caller }) func createHabit(name : Text, created : Date) : async HabitId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create habits");
    };
    let id = nextHabitId;
    nextHabitId += 1;

    let habit : Habit = {
      id;
      name;
      created;
      executions = [];
    };

    let habits = getHabitsForCaller(caller);
    habits.add(id, habit);
    saveHabitsForCaller(caller, habits);

    id;
  };

  public shared ({ caller }) func deleteHabit(id : HabitId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete habits");
    };
    let habits = getHabitsForCaller(caller);
    switch (habits.get(id)) {
      case (null) { Runtime.trap("Habit does not exist") };
      case (?_) {
        habits.remove(id);
        saveHabitsForCaller(caller, habits);
      };
    };
  };

  // Marking Tasks
  public shared ({ caller }) func markComplete(id : HabitId, date : Date) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark habits complete");
    };
    let habits = getHabitsForCaller(caller);
    switch (habits.get(id)) {
      case (null) { Runtime.trap("No habit exists for this id") };
      case (?habit) {
        let newExecutions = habit.executions.concat([date]);
        let newHabit : Habit = {
          id = habit.id;
          name = habit.name;
          created = habit.created;
          executions = newExecutions;
        };
        habits.add(id, newHabit);
        saveHabitsForCaller(caller, habits);
      };
    };
  };

  public shared ({ caller }) func unmarkComplete(id : HabitId, date : Date) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unmark habits complete");
    };
    let habits = getHabitsForCaller(caller);
    switch (habits.get(id)) {
      case (null) { Runtime.trap("Habit does not exist") };
      case (?habit) {
        let executions = habit.executions.filter(func(d) { d != date });
        let newHabit : Habit = {
          id = habit.id;
          name = habit.name;
          created = habit.created;
          executions;
        };
        habits.add(id, newHabit);
        saveHabitsForCaller(caller, habits);
      };
    };
  };

  func toHabitView(habit : Habit) : HabitView {
    {
      id = habit.id;
      name = habit.name;
      created = habit.created;
      executions = habit.executions;
    };
  };

  public query ({ caller }) func getHabits() : async [(HabitId, HabitView)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get habits");
    };
    getHabitsForCaller(caller).toArray().map(func((id, habit)) { (id, toHabitView(habit)) });
  };

  public query ({ caller }) func getHabit(id : HabitId) : async HabitView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get habits");
    };
    let habits = getHabitsForCaller(caller);
    switch (habits.get(id)) {
      case (null) { Runtime.trap("Habit does not exist") };
      case (?habit) { toHabitView(habit) };
    };
  };
};
