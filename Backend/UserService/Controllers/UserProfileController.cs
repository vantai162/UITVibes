using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserService.DTOs;
using UserService.ServiceLayer.Interface;

namespace UserService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    private readonly IUserProfileService _userProfileService;
    private readonly ILogger<UserProfileController> _logger;

    public UserProfileController(
        IUserProfileService userProfileService,
        ILogger<UserProfileController> logger)
    {
        _userProfileService = userProfileService;
        _logger = logger;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(Guid userId)
    {
        var profile = await _userProfileService.GetProfileByUserIdAsync(userId);
        
        if (profile == null)
        {
            return NotFound(new { message = "Profile not found" });
        }

        return Ok(profile);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var profile = await _userProfileService.GetProfileByUserIdAsync(userId);
        
        if (profile == null)
        {
            return NotFound(new { message = "Profile not found" });
        }

        return Ok(profile);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var updatedProfile = await _userProfileService.UpdateProfileAsync(userId, request);
            return Ok(updatedProfile);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Profile not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while updating profile" });
        }
    }
}