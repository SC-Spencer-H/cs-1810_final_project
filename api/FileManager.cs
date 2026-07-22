using System.IO;
using System.Text.Json;
using System.Windows.Media.Imaging;
using System.Drawing;

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

    private string WorkingFolderPath { get; set; }
    private List<TagData> TagIndex { get; set; }

    /////////////////////////////////////////////////////////////////////////////////////////

    private FileManager() { }

    /////////////////////////////////////////////////////////////////////////////////////////

    public static void SetWorkingFolder(FolderRequestArgs args)
    {
        if (args.FolderPath != Instance.WorkingFolderPath)
        {
            Instance.WorkingFolderPath = args.FolderPath;
            Instance.TagIndex = LoadTagIndex();
            if (Instance.TagIndex == null)
                Instance.TagIndex = new List<TagData>();
        }
    }

    public static List<FileData> GetAllFileData()
    {
        if (Instance.WorkingFolderPath == null)
            throw new InvalidOperationException("Working folder is not set");

        string[] filePaths = Directory.GetFiles(Instance.WorkingFolderPath, "*.jpg", SearchOption.AllDirectories);
        filePaths.Concat(Directory.GetFiles(Instance.WorkingFolderPath, "*.jpeg", SearchOption.AllDirectories)).ToArray();
        List<FileData> fileList = new List<FileData>();

        foreach (string path in filePaths)
        {   
            JpegMetadataAdapter jpeg = new JpegMetadataAdapter(path);
            string[] tags = null;
            if (jpeg.Metadata.Keywords != null)
            {
                tags = jpeg.Metadata.Keywords.ToArray();
            }
            FileData fileData = new FileData(path, tags);
            fileList.Add(fileData);
        }

        return fileList;
    }

    public static List<TagData> GetTagIndex()
    {
        if (Instance.WorkingFolderPath == null)
            throw new InvalidOperationException("Working folder is not set");

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

    /////////////////////////////////////////////////////////////////////////////////////////

    public static IResult AddTag(TagRequestArgs args)
    {
        if (Instance.WorkingFolderPath == null)
            return Results.Problem("Working folder is not set");

        JpegMetadataAdapter jpeg = new JpegMetadataAdapter(args.FilePath);
        List<string> tagList = jpeg.Metadata.Keywords.ToList();

        tagList.Add(args.TagName);

        jpeg.Metadata.Keywords = tagList.ToArray().AsReadOnly();
        jpeg.Save();

        if (Instance.TagIndex.Find(t => t.Name == args.TagName) == null)
        {
            Instance.TagIndex.Add(new TagData(args.TagName));
            SaveTagIndex();
        }

        return Results.Ok();
    }

    public static IResult RemoveTag(TagRequestArgs args)
    {
        if (Instance.WorkingFolderPath == null)
            return Results.Problem("Working folder is not set");

        JpegMetadataAdapter jpeg = new JpegMetadataAdapter(args.FilePath);
        List<string> tagList = jpeg.Metadata.Keywords.ToList();


        bool result = tagList.Remove(args.TagName);
        if (!result)
            return Results.Problem("Tag does not exist");

        jpeg.Metadata.Keywords = tagList.ToArray().AsReadOnly();
        jpeg.Save();

        return Results.Ok();
    }

    public static IResult MoveTag(TagRequestArgs args)
    {
        if (Instance.WorkingFolderPath == null)
            return Results.Problem("Working folder is not set");

        JpegMetadataAdapter jpeg = new JpegMetadataAdapter(args.FilePath);
        List<string> tagList = jpeg.Metadata.Keywords.ToList();

        string tag = tagList.Find(t => t == args.TagName);
        if (tag == null)
            return Results.Problem("Tag does not exist");

        tagList.Remove(tag);
        tagList.Insert(args.InsertAt, tag);

        jpeg.Metadata.Keywords = tagList.ToArray().AsReadOnly();
        jpeg.Save();

        return Results.Ok();
    }

    public static IResult AddAlias(AliasRequestArgs args)
    {
        if (Instance.WorkingFolderPath == null)
            return Results.Problem("Working folder is not set");

        var test = Instance.TagIndex;

        TagData tag = Instance.TagIndex.Find(t => t.Name == args.TagName);

        if (tag.Aliases == null)
            tag.Aliases = new List<string>();

        tag.Aliases.Add(args.AliasName);

        SaveTagIndex();

        return Results.Ok();
    }

    public static IResult RemoveAlias(AliasRequestArgs args)
    {
        if (Instance.WorkingFolderPath == null)
            return Results.Problem("Working folder is not set");

        TagData tag = Instance.TagIndex.Find(t => t.Name == args.TagName);

        if (tag.Aliases == null)
            return Results.Ok();

        tag.Aliases.Remove(args.AliasName);

        SaveTagIndex();

        return Results.Ok();
    }

    /////////////////////////////////////////////////////////////////////////////////////////

    private static void SaveTagIndex()
    {
        if (Instance.WorkingFolderPath == null)
            throw new InvalidOperationException("Working folder is not set");
        if (Instance.TagIndex == null)
            throw new InvalidOperationException("Tag index not loaded");

        string tagIndexJson = JsonSerializer.Serialize(Instance.TagIndex, new JsonSerializerOptions() { WriteIndented = true });
        string cleanedWorkingFolderPath = string.Join('-', Instance.WorkingFolderPath.Substring(3).Split('\\'));
        string tagIndexFilePath = @$"TagIndices\{cleanedWorkingFolderPath}.json";
        File.WriteAllText(tagIndexFilePath, tagIndexJson);
    }

    private static List<TagData> LoadTagIndex()
    {
        if (Instance.WorkingFolderPath == null)
            throw new InvalidOperationException("Working folder is not set");

        string cleanedWorkingFolderPath = string.Join('-', Instance.WorkingFolderPath.Substring(3).Split('\\'));
        string tagIndexFilePath = @$"TagIndices\{cleanedWorkingFolderPath}.json";
        if (File.Exists(tagIndexFilePath))
        {
            string tagIndexJson = File.ReadAllText(tagIndexFilePath);
            return JsonSerializer.Deserialize<List<TagData>>(tagIndexJson);
        }
        else
            return null;
    }

    public static void IndexWorkingFolder()
    {
        if (Instance.WorkingFolderPath == null)
            throw new InvalidOperationException("Working folder is not set");

        if (Instance.TagIndex == null)
            Instance.TagIndex = LoadTagIndex();

        List<TagData> tagIndex = Instance.TagIndex;
        if (tagIndex == null)
            tagIndex = new List<TagData>();

        string[] filePaths = Directory.GetFiles(Instance.WorkingFolderPath, "*.*", SearchOption.AllDirectories);
        List<TagData> unusedTags = tagIndex.ToList();

        foreach (string path in filePaths)
        {
            JpegMetadataAdapter jpeg = new JpegMetadataAdapter(path);
            if (jpeg.Metadata.Keywords == null)
                continue;
            string[] tags = jpeg.Metadata.Keywords.ToArray();
            foreach (string tagName in tags)
            {
                TagData tag = tagIndex.Find(t => t.Name == tagName);
                if (tag != null)
                {
                    unusedTags.Remove(tag);
                }
                else
                {
                    tagIndex.Add(new TagData(tagName));
                }
            }
        }

        foreach (TagData tag in unusedTags)
        {
            tagIndex.Remove(tag);
        }

        SaveTagIndex();
    }
}
