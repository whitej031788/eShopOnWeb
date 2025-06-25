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

    public class MultidimensionalArrayExample
{
    // SonarQube: S2368: Public methods should not have multidimensional array parameters.
    public void ProcessMatrix(int[,] matrix) 
    {
        Console.WriteLine("Processing a 2D matrix...");
        for (int i = 0; i < matrix.GetLength(0); i++)
        {
            for (int j = 0; j < matrix.GetLength(1); j++)
            {
                Console.Write($"{matrix[i, j]} ");
            }
            Console.WriteLine();
        }
    }

    // This method also violates S2368
    public double CalculateDeterminant(double[,,] cube)
    {
        Console.WriteLine("Calculating determinant of a 3D cube (not really, just an example).");
        // Imagine complex calculations here with the 3D array
        return 0.0; 
    }

    // A compliant alternative using a jagged array
    public void ProcessJaggedArray(int[][] jaggedArray)
    {
        Console.WriteLine("Processing a jagged array...");
        foreach (var row in jaggedArray)
        {
            foreach (var item in row)
            {
                Console.Write($"{item} ");
            }
            Console.WriteLine();
        }
    }
}

// How to call the violating methods
public class Consumer
{
    public void Run()
    {
        var example = new MultidimensionalArrayExample();

        int[,] myMatrix = new int[2, 3] { { 1, 2, 3 }, { 4, 5, 6 } };
        example.ProcessMatrix(myMatrix); // This call triggers the S2368 violation

        double[,,] myCube = new double[2, 2, 2];
        example.CalculateDeterminant(myCube); // This call also triggers the S2368 violation

        int[][] myJaggedArray = new int[][]
        {
            new int[] { 10, 20, 30 },
            new int[] { 40, 50 }
        };
        example.ProcessJaggedArray(myJaggedArray); // This is compliant
    }
}
}
