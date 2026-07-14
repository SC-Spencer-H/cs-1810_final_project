using System.Text.Json;
using Microsoft.WindowsAPICodePack.Shell;
using Microsoft.WindowsAPICodePack.Shell.PropertySystem;
using Microsoft.WindowsAPICodePack.ShellExtensions;

public class FileManager
{
    /////////////////////////////////////////////////////////////////////////////////////////

    private static FileManager _instance;
    public static FileManager Instance
    {
        get
        {
            if (_instance == null)
                _instance = new FileManager();

            return _instance;
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////

    private string WorkingFolderPath = @"C:\Users\Hallwaerd\MyFolders\School\2026-SUMMER\CS-1810\(2026_07_31)_final_project\cs-1810_final_project\res";
    private List<TagData> TagIndex { get; set; }

    /////////////////////////////////////////////////////////////////////////////////////////

    private FileManager() { }

    /////////////////////////////////////////////////////////////////////////////////////////

    public static List<FileData> GetFiles()
    {
        string[] filePaths = Directory.GetFiles(Instance.WorkingFolderPath);

        ShellObject[] shells = new ShellObject[filePaths.Length];

        for (int i = 0; i < filePaths.Length; i++)
        {
            shells[i] = ShellObject.FromParsingName(filePaths[i]);
        }

        List<FileData> fileList = new List<FileData>();

        for (int i = 0; i < filePaths.Length; i++)
        {
            FileData data = new FileData(filePaths[i], shells[i].Properties.System.Keywords.Value);
            fileList.Add(data);
        }

        return fileList;
    }

    public static List<TagData> GetIndex()
    {
        if (Instance.TagIndex == null)
        {
            IndexWorkingFolder();
            Instance.TagIndex = LoadTagIndex();
        }
        return Instance.TagIndex;
    }

    public static IResult GetImage(string path)
    {
        return Results.File(path, "image/jpg");
    }

    public static void SetTags(FileData data)
    {
        ShellObject shell = ShellObject.FromParsingName(data.Path);

        var writer = shell.Properties.GetPropertyWriter();
        writer.WriteProperty(SystemProperties.System.Keywords, data.Tags);
        writer.Close();
    }

    /////////////////////////////////////////////////////////////////////////////////////////

    private static void IndexWorkingFolder()
    {
        List<TagData> tagIndex = new List<TagData>();
        string[] filePaths = Directory.GetFiles(Instance.WorkingFolderPath);

        foreach (string path in filePaths)
        {
            ShellObject fileShell = ShellObject.FromParsingName(path);
            string[] fileTags = fileShell.Properties.System.Keywords.Value;

            foreach (string tag in fileTags)
            {
                if (tagIndex.Find(t => t.Name == tag) == null)
                {
                    tagIndex.Add(new TagData(tag));
                }
            }
        }

        string tagIndexJson = JsonSerializer.Serialize(tagIndex, new JsonSerializerOptions() { WriteIndented = true });
        string cleanedWorkingFolderPath = string.Join('-', Instance.WorkingFolderPath.Substring(3).Split('\\'));
        string tagIndexFilePath = @$"TagIndices\{cleanedWorkingFolderPath}.json";
        File.WriteAllText(tagIndexFilePath, tagIndexJson);
    }

    private static List<TagData> LoadTagIndex()
    {
        string cleanedWorkingFolderPath = string.Join('-', Instance.WorkingFolderPath.Substring(3).Split('\\'));
        string tagIndexFilePath = @$"TagIndices\{cleanedWorkingFolderPath}.json";
        string tagIndexJson = File.ReadAllText(tagIndexFilePath);
        List<TagData> tagIndex = JsonSerializer.Deserialize<List<TagData>>(tagIndexJson);

        return tagIndex;
    }
}
