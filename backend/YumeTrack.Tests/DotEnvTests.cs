using Microsoft.Extensions.Configuration;
using YumeTrack.API.Configuration;

namespace YumeTrack.Tests;

public class DotEnvTests
{
    [Fact]
    public void Load_ParsesKeysQuotesAndComments()
    {
        var path = Path.GetTempFileName();
        File.WriteAllText(path, string.Join('\n',
            "# comentario",
            "",
            "ConnectionStrings__DefaultConnection=Host=localhost;Password=abc=def",
            "Email__From=\"YumeTrack <a@b.com>\"",
            "Email__Password='clave con espacios'",
            "Sin igual"));

        try
        {
            var config = new ConfigurationBuilder();
            DotEnv.Load(config, path);
            var built = config.Build();

            Assert.Equal("Host=localhost;Password=abc=def", built["ConnectionStrings:DefaultConnection"]);
            Assert.Equal("YumeTrack <a@b.com>", built["Email:From"]);
            Assert.Equal("clave con espacios", built["Email:Password"]);
        }
        finally
        {
            File.Delete(path);
        }
    }

    [Fact]
    public void Load_IgnoresMissingFile()
    {
        var config = new ConfigurationBuilder();

        DotEnv.Load(config, Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".env"));

        Assert.Empty(config.Build().AsEnumerable().Where(p => p.Value is not null));
    }
}
