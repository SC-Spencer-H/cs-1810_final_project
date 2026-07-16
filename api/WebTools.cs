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
        app.MapGet("/files", () => JsonSerializer.Serialize(FileManager.GetFiles()));
        app.MapGet("/index", () => JsonSerializer.Serialize(FileManager.GetIndex()));
        app.MapGet("/image", FileManager.GetImage);
        app.MapPost("/tags", FileManager.SetTags);
        app.MapPost("/folder", FileManager.SetWorkingFolder);
    }
}
