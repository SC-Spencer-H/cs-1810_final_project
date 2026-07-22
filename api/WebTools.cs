using System.Text.Json;

public static class WebTools
{
    public static WebApplication InitApp()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddCors();
        
        var app = builder.Build();
        app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
        
        MapRequests(app);

        return app;
    }

    public static void MapRequests(WebApplication app)
    {
        app.MapGet("/fileData", () => JsonSerializer.Serialize(FileManager.GetAllFileData()));
        app.MapGet("/tagIndex", () => JsonSerializer.Serialize(FileManager.GetTagIndex()));
        app.MapGet("/indexFolder", FileManager.IndexWorkingFolder);
        app.MapGet("/getImage", FileManager.GetImage);
        app.MapPost("/setFolder", FileManager.SetWorkingFolder);
        app.MapPost("/addTag", FileManager.AddTag);
        app.MapPost("/removeTag", FileManager.RemoveTag);
        app.MapPost("/moveTag", FileManager.MoveTag);
        app.MapPost("/addAlias", FileManager.AddAlias);
        app.MapPost("/removeAlias", FileManager.RemoveAlias);
    }
}
