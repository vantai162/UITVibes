using Microsoft.EntityFrameworkCore;
using UserService.DTOs;
using UserService.Models;
using UserService.ServiceLayer.Interface;

namespace UserService.ServiceLayer.Implementation;

public class UserProfileService : IUserProfileService
{
    private readonly UserDbContext _context;
    private readonly ILogger<UserProfileService> _logger;

    public UserProfileService(UserDbContext context, ILogger<UserProfileService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserProfileDto?> GetProfileByUserIdAsync(Guid userId)
    {
        var profile = await _context.UserProfiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            return null;
        }

        return MapToDto(profile);
    }

    public async Task<UserProfileDto> CreateProfileAsync(Guid userId, string username)
    {
        // Check if profile already exists
        var existingProfile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (existingProfile != null)
        {
            throw new InvalidOperationException("Profile already exists for this user");
        }

        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DisplayName = username, // Default to username
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created profile for user {UserId}", userId);

        return MapToDto(profile);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var profile = await _context.UserProfiles
            .Include(p => p.SocialLinks)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            throw new KeyNotFoundException("Profile not found");
        }

        // Update basic fields
        if (request.DisplayName != null)
            profile.DisplayName = request.DisplayName;
        
        if (request.Bio != null)
            profile.Bio = request.Bio;
        
        if (request.AvatarUrl != null)
            profile.AvatarUrl = request.AvatarUrl;
        
        if (request.CoverImageUrl != null)
            profile.CoverImageUrl = request.CoverImageUrl;
        
        if (request.DateOfBirth.HasValue)
            profile.DateOfBirth = request.DateOfBirth.Value;
        
        if (request.Location != null)
            profile.Location = request.Location;
        
        if (request.Website != null)
            profile.Website = request.Website;

        // Update social links if provided
        if (request.SocialLinks != null)
        {
            // Remove existing links
            _context.SocialLinks.RemoveRange(profile.SocialLinks);
            
            // Add new links
            foreach (var linkDto in request.SocialLinks)
            {
                profile.SocialLinks.Add(new SocialLink
                {
                    Id = Guid.NewGuid(),
                    UserProfileId = profile.Id,
                    Platform = linkDto.Platform,
                    Url = linkDto.Url,
                    DisplayOrder = linkDto.DisplayOrder
                });
            }
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated profile for user {UserId}", userId);

        return MapToDto(profile);
    }

    public async Task DeleteProfileAsync(Guid userId)
    {
        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile != null)
        {
            _context.UserProfiles.Remove(profile);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Deleted profile for user {UserId}", userId);
        }
    }

    private static UserProfileDto MapToDto(UserProfile profile)
    {
        return new UserProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            DisplayName = profile.DisplayName,
            Bio = profile.Bio,
            AvatarUrl = profile.AvatarUrl,
            CoverImageUrl = profile.CoverImageUrl,
            DateOfBirth = profile.DateOfBirth == default ? null : profile.DateOfBirth,
            Location = profile.Location,
            Website = profile.Website,
            SocialLinks = profile.SocialLinks.Select(sl => new SocialLinkDto
            {
                Id = sl.Id,
                Platform = sl.Platform,
                Url = sl.Url,
                DisplayOrder = sl.DisplayOrder
            }).OrderBy(sl => sl.DisplayOrder).ToList()
        };
    }
}