using System.Text.Json.Serialization;

public class FolderRequestArgs
{
    [JsonPropertyName("folderPath")]
    public string FolderPath { get; init; }

    public FolderRequestArgs(string folderPath)
    {
        FolderPath = folderPath;
    }
}