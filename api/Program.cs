
internal partial class Program
{
    static void Main()
    {
        var tags = FileManager.GetAllTags();

        WebApplication app = WebTools.InitApp();
        app.Run();
    }
}