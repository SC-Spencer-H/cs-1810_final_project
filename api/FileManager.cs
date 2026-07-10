using Microsoft.WindowsAPICodePack.Shell;
using Microsoft.WindowsAPICodePack.Shell.PropertySystem;
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

    public static List<FileData> GetAllTags()
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
}
