using Microsoft.WindowsAPICodePack.Shell;
using Microsoft.WindowsAPICodePack.ShellExtensions;

public class FileManager
{
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

    private string WorkingFolderPath = @"C:\Users\Hallwaerd\MyFolders\School\2026-SUMMER\CS-1810\(2026_07_31)_final_project\cs-1810_final_project\res";

    private FileManager() { }

    public static Dictionary<string, string[]> GetAllTags()
    {
        string[] filePaths = Directory.GetFiles(Instance.WorkingFolderPath);

        ShellObject[] shells = new ShellObject[filePaths.Length];

        for (int i = 0; i < filePaths.Length; i++)
        {
            shells[i] = ShellObject.FromParsingName(filePaths[i]);
        }

        Dictionary<string, string[]> tags = new Dictionary<string, string[]>();

        for (int i = 0; i < filePaths.Length; i++)
        {
            tags.Add(filePaths[i], shells[i].Properties.System.Keywords.Value);
        }

        return tags;
    }

    public static IResult GetImage(string path)
    {
        return Results.File(path, "image.jpg");
    }
}