using System.Text.Json.Serialization;

public class FolderRequestArgs
{
    [JsonPropertyName("folderPath")]
    public string FolderPath { get; set; }

    public FolderRequestArgs(string folderPath)
    {
        FolderPath = folderPath;
    }
}