namespace GravityGolf.Core
{

    public sealed class StepResult
    {
        public string Type { get; set; } = "flying";
        public string Reason { get; set; } = "";
        public int? PlanetIndex { get; set; }
        public string PlanetName { get; set; } = "";
    }
}
