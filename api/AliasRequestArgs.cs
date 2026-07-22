using System.Text.Json.Serialization;

public class AliasRequestArgs
{
    [JsonPropertyName("tagName")]
    public string TagName { get; init; }
    [JsonPropertyName("aliasName")]
    public string AliasName { get; init; }

    public AliasRequestArgs(string tagName, string aliasName)
    {
        TagName = tagName;
        AliasName = aliasName;
    }
}