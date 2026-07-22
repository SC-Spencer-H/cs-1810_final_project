using System.Text.Json.Serialization;

public class TagRequestArgs
{
    [JsonPropertyName("filePath")]
    public string FilePath { get; init; }
    [JsonPropertyName("tagName")]
    public string TagName { get; init; }
    [JsonPropertyName("insertAt")]
    public int InsertAt { get; init; }

    public TagRequestArgs(string filePath, string tagName, int insertAt = -1)
    {
        FilePath = filePath;
        TagName = tagName;
        InsertAt = insertAt;
    }
}