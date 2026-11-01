namespace YumeTrack.API.Configuration;

// Lee un archivo .env (CLAVE=valor) y lo suma a la configuración.
// "__" equivale a ":" (ConnectionStrings__DefaultConnection => ConnectionStrings:DefaultConnection).
public static class DotEnv
{
    public static void Load(IConfigurationBuilder configuration, string path)
    {
        if (!File.Exists(path))
            return;

        var values = new Dictionary<string, string?>();

        foreach (var rawLine in File.ReadAllLines(path))
        {
            var line = rawLine.Trim();

            if (line.Length == 0 || line.StartsWith('#'))
                continue;

            var separator = line.IndexOf('=');
            if (separator <= 0)
                continue;

            var key = line[..separator].Trim().Replace("__", ":");
            var value = line[(separator + 1)..].Trim();

            if (value.Length >= 2 &&
                ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
            {
                value = value[1..^1];
            }

            values[key] = value;
        }

        configuration.AddInMemoryCollection(values);
    }
}
