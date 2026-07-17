using System.Text.Json.Serialization;

public class TagData
{
    [JsonPropertyName("name")]
    public string Name { get; set; }
    [JsonPropertyName("aliases")]
    public List<string> Aliases { get; set; }

    public TagData(string name)
    {
        Name = name;
        Aliases = CreateAliases(name);
    }

    private List<string> CreateAliases(string name)
    {
        return null;
    }
}