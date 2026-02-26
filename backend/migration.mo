import Map "mo:core/Map";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type HabitId = Int;
  type Date = Int; // Unix timestamp (seconds since 1970-01-01)
  type Execution = Date;

  type Habit = {
    id : HabitId;
    name : Text;
    created : Date;
    executions : [Execution];
  };

  type OldActor = {
    habits : Map.Map<HabitId, Habit>;
    nextHabitId : HabitId;
  };

  type NewActor = {
    userHabits : Map.Map<Principal, Map.Map<HabitId, Habit>>;
    nextHabitId : HabitId;
  };

  public func run(old : OldActor) : NewActor {
    let userHabits = Map.empty<Principal, Map.Map<HabitId, Habit>>();
    {
      userHabits;
      nextHabitId = old.nextHabitId;
    };
  };
};
