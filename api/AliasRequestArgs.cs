using System.Text.Json.Serialization;

public class AliasRequestArgs
{
    [JsonPropertyName("tagName")]
    public string TagName { get; set; }
    [JsonPropertyName("aliasName")]
    public string AliasName { get; set; }

    public AliasRequestArgs(string tagName, string aliasName)
    {
        TagName = tagName;
        AliasName = aliasName;
    }
}