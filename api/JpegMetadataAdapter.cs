
using System.IO;
using System.Windows.Media.Imaging;

public class JpegMetadataAdapter
{
    private string _path { get; init; }
    private BitmapFrame _frame { get; init; }
    public BitmapMetadata Metadata { get; init; }

    public JpegMetadataAdapter(string path)
    {
        _path = path;
        _frame = GetBitmapFrame(path);
        Metadata = (BitmapMetadata)_frame.Metadata.Clone();
    }

    public void Save()
    {
        SaveAs(_path);
    }

    public void SaveAs(string path)
    {
        JpegBitmapEncoder encoder = new JpegBitmapEncoder();
        encoder.Frames.Add(BitmapFrame.Create(_frame, _frame.Thumbnail, Metadata, _frame.ColorContexts));
        using (Stream stream = File.Open(path, FileMode.Create, FileAccess.ReadWrite))
        {
            encoder.Save(stream);
        }
    }

    private BitmapFrame GetBitmapFrame(string path)
    {
        BitmapDecoder? decoder = null;
        using (Stream stream = File.Open(path, FileMode.Open, FileAccess.ReadWrite, FileShare.None))
        {
            decoder = new JpegBitmapDecoder(stream, BitmapCreateOptions.PreservePixelFormat, BitmapCacheOption.OnLoad);
        }
        return decoder.Frames[0];
    }
}