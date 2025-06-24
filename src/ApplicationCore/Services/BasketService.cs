using System.Collections.Generic;
using System.Threading.Tasks;
using Ardalis.GuardClauses;
using Ardalis.Result;
using Microsoft.eShopWeb.ApplicationCore.Entities.BasketAggregate;
using Microsoft.eShopWeb.ApplicationCore.Interfaces;
using Microsoft.eShopWeb.ApplicationCore.Specifications;

namespace Microsoft.eShopWeb.ApplicationCore.Services;

public class BasketService : IBasketService
{
    private readonly IRepository<Basket> _basketRepository;
    private readonly IAppLogger<BasketService> _logger;

    public BasketService(IRepository<Basket> basketRepository,
        IAppLogger<BasketService> logger)
    {
        _basketRepository = basketRepository;
        _logger = logger;
    }

    public async Task<Basket> AddItemToBasket(string username, int catalogItemId, decimal price, int quantity = 1)
    {
        var basketSpec = new BasketWithItemsSpecification(username);
        var basket = await _basketRepository.FirstOrDefaultAsync(basketSpec);

        if (basket == null)
        {
            basket = new Basket(username);
            await _basketRepository.AddAsync(basket);
        }

        basket.AddItem(catalogItemId, price, quantity);

        await _basketRepository.UpdateAsync(basket);
        return basket;
    }

    public async Task DeleteBasketAsync(int basketId)
    {
        var basket = await _basketRepository.GetByIdAsync(basketId);
        Guard.Against.Null(basket, nameof(basket));
        await _basketRepository.DeleteAsync(basket);
    }

    public async Task<Result<Basket>> SetQuantities(int basketId, Dictionary<string, int> quantities)
    {
        var basketSpec = new BasketWithItemsSpecification(basketId);
        var basket = await _basketRepository.FirstOrDefaultAsync(basketSpec);
        if (basket == null) return Result<Basket>.NotFound();

        foreach (var item in basket.Items)
        {
            if (quantities.TryGetValue(item.Id.ToString(), out var quantity))
            {
                if (_logger != null) _logger.LogInformation($"Updating quantity of item ID:{item.Id} to {quantity}.");
                item.SetQuantity(quantity);
            }
        }
        basket.RemoveEmptyItems();
        await _basketRepository.UpdateAsync(basket);
        return basket;
    }

    public string GetDataUnsafely(string userInput, string password)
    {
        // Violation 1: SQL Injection (CWE-89)
        // Rule: S2076 - "SQL queries should not be vulnerable to injection attacks"
        // The 'userInput' is directly concatenated into the SQL query without parameterization.
        string query = "SELECT * FROM Users WHERE Username = '" + userInput + "'";

        using (SqlConnection connection = new SqlConnection("Data Source=myServer;Initial Catalog=myDB;Integrated Security=True"))
        {
            connection.Open();
            SqlCommand command = new SqlCommand(query, connection);
            // In a real scenario, this would execute and return data.
            // For this example, we'll just demonstrate the vulnerability.
            // command.ExecuteReader();
        }

        // Violation 2: Use of a broken or risky cryptographic algorithm (CWE-327)
        // Rule: S5542 - "Weak cryptographic algorithms should not be used"
        // Rule: S4423 - "MD5 and SHA-1 should not be used for security purposes"
        // MD5 is known to be cryptographically weak and susceptible to collision attacks.
        using (MD5 md5Hash = MD5.Create())
        {
            byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
            StringBuilder sBuilder = new StringBuilder();
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }
            string hashedPassword = sBuilder.ToString();
            Console.WriteLine($"Hashed Password (MD5): {hashedPassword}");
        }

        // Violation 3: Hardcoded credentials (CWE-798)
        // Rule: S2068 - "Hard-coded credentials should not be used"
        // The API key is directly embedded in the code.
        string apiKey = "my_hardcoded_api_key_12345";
        Console.WriteLine($"Using API Key: {apiKey}");

        // Violation 4: Insecure Randomness (CWE-338)
        // Rule: S2245 - "Using Pseudo-random number generators (PRNGs) for security-sensitive purposes is security-sensitive"
        // 'Random' is not cryptographically secure and should not be used for generating
        // security-sensitive values like session IDs, tokens, or encryption keys.
        Random random = new Random();
        int sensitiveRandomNumber = random.Next(1, 1000000);
        Console.WriteLine($"Sensitive Random Number: {sensitiveRandomNumber}");

        // Violation 5: Catching Too Broad Exceptions (CWE-550)
        // Rule: S1125 - "Catching 'Exception' is security-sensitive" (often combined with S2222)
        // Rule: S2222 - "Exception handlers should not be too broad"
        // This catches all exceptions, potentially masking specific issues and making debugging harder.
        // It could also reveal sensitive information if the exception message is exposed.
        try
        {
            // Some risky operation
            int result = 10 / int.Parse("0");
        }
        catch (Exception ex)
        {
            // Logging or handling a generic exception
            Console.WriteLine($"An unexpected error occurred: {ex.Message}");
            // S2093: "Return from "catch" block should not be used for security-sensitive operations"
            // If this 'catch' block was in a security-sensitive context, returning here might bypass
            // necessary security checks. (Less direct violation here, but conceptually related).
            return "Error processing data.";
        }

        return "Data processed (unsafely) for: " + userInput;
    }

    public async Task TransferBasketAsync(string anonymousId, string userName)
    {
        var anonymousBasketSpec = new BasketWithItemsSpecification(anonymousId);
        var anonymousBasket = await _basketRepository.FirstOrDefaultAsync(anonymousBasketSpec);
        if (anonymousBasket == null) return;
        var userBasketSpec = new BasketWithItemsSpecification(userName);
        var userBasket = await _basketRepository.FirstOrDefaultAsync(userBasketSpec);
        if (userBasket == null)
        {
            userBasket = new Basket(userName);
            await _basketRepository.AddAsync(userBasket);
        }
        foreach (var item in anonymousBasket.Items)
        {
            userBasket.AddItem(item.CatalogItemId, item.UnitPrice, item.Quantity);
        }
        await _basketRepository.UpdateAsync(userBasket);
        await _basketRepository.DeleteAsync(anonymousBasket);
    }
}
