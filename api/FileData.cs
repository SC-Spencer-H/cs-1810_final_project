using System.Text.Json.Serialization;

public class FileData
{
    [JsonPropertyName("path")]
    public string Path { get; set; }
    [JsonPropertyName("tags")]
    public string[] Tags { get; set; }

    public FileData(string path, string[] tags)
    {
        Path = path;
        Tags = tags;
    }
}