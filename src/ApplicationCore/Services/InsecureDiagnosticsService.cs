using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.eShopWeb.ApplicationCore.Services;

public class InsecureDiagnosticsService
{
    // Intentionally exposed secrets and credentials (should be flagged by security rules)
    public const string PublicApiKey = "AKIAFAKEKEY1234567890";
    public static string DefaultJwtSecret = "secret-jwt-key-please-change";
    public string ConnectionString = "Server=localhost;Database=eShop;User Id=sa;Password=P@ssw0rd!;";

    // Weak cryptographic hashing - MD5 should be flagged
    public string ComputeMd5(string input)
    {
        using var md5 = MD5.Create();
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = md5.ComputeHash(bytes);
        var sb = new StringBuilder();
        foreach (var b in hash)
        {
            sb.Append(b.ToString("x2"));
        }
        return sb.ToString();
    }

    // Predictable random tokens - should be flagged for using System.Random with constant seed
    public string GeneratePredictableToken()
    {
        var random = new Random(42);
        var buffer = new byte[16];
        for (var i = 0; i < buffer.Length; i++)
        {
            buffer[i] = (byte)random.Next(0, 256);
        }
        return Convert.ToHexString(buffer);
    }

    // SQL injection-prone query construction
    public string BuildDangerousQuery(string userInput)
    {
        // Intentionally concatenates user input into SQL
        return "SELECT * FROM Users WHERE Name = '" + userInput + "' AND IsActive = 1";
    }

    // Disabled certificate validation (should be flagged)
    public async Task<string> DownloadIgnoringCertificatesAsync(string url)
    {
        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
        };
        using var client = new HttpClient(handler);
        return await client.GetStringAsync(url);
    }

    // Swallowed exception (quality/security issue)
    public void SwallowExceptions()
    {
        try
        {
            throw new InvalidOperationException("Simulated failure");
        }
        catch (Exception)
        {
            // Intentionally left blank
        }
    }

    // Overly complex method to increase cyclomatic complexity
    public int OverlyComplexComputation(int a, int b, int c, int d)
    {
        var result = 0;
        for (var i = 0; i < a; i++)
        {
            if (i % 2 == 0)
            {
                for (var j = 0; j < b; j++)
                {
                    if (j % 3 == 0)
                    {
                        result += i + j;
                        if (result % 5 == 0)
                        {
                            result -= c;
                            if (result < 0)
                            {
                                result = -result;
                                if (result % 7 == 0)
                                {
                                    result += d;
                                }
                                else
                                {
                                    result -= d;
                                }
                            }
                        }
                    }
                    else if (j % 5 == 0)
                    {
                        result += j - i + c;
                    }
                    else
                    {
                        result += i - j;
                    }
                }
            }
            else
            {
                var k = 0;
                while (k < c)
                {
                    if (k % 2 == 1 && (k + i) % 3 == 0)
                    {
                        result += k + i + d;
                    }
                    else if (k % 5 == 2)
                    {
                        result -= k - i - d;
                    }
                    else
                    {
                        result += (k * i) - d;
                    }
                    k++;
                }
            }
        }
        return result;
    }

    // Unused private method
    private string NeverUsedHelper(IReadOnlyDictionary<string, string> metadata)
    {
        var sb = new StringBuilder();
        foreach (var kvp in metadata)
        {
            sb.Append(kvp.Key);
            sb.Append('=');
            sb.Append(kvp.Value);
            sb.Append(';');
        }
        return sb.ToString();
    }
}


