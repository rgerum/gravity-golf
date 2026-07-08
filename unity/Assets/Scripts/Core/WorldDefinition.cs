using System.Collections.Generic;
using Newtonsoft.Json;

namespace GravityGolf.Core
{

    public sealed class WorldDefinition
    {
        [JsonProperty("schemaVersion")]
        public int SchemaVersion { get; set; }

        [JsonProperty("generatedFrom")]
        public string GeneratedFrom { get; set; } = "";

        [JsonProperty("worldId")]
        public string WorldId { get; set; } = "";

        [JsonProperty("worldName")]
        public string WorldName { get; set; } = "";

        [JsonProperty("worldNumber")]
        public int WorldNumber { get; set; }

        [JsonProperty("worldSize")]
        public int WorldSize { get; set; }

        [JsonProperty("levels")]
        public List<LevelRuntime> Levels { get; set; } = new List<LevelRuntime>();
    }
}
