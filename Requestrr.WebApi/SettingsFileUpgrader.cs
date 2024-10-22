using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Requestrr.WebApi.RequestrrBot.DownloadClients.Lidarr;
using Requestrr.WebApi.RequestrrBot.DownloadClients.Overseerr;
using Requestrr.WebApi.RequestrrBot.DownloadClients.Radarr;
using Requestrr.WebApi.RequestrrBot.DownloadClients.Sonarr;

namespace Requestrr.WebApi
{
    public static class SettingsFileUpgrader
    {
        public static void Upgrade(string settingsFilePath)
        {
            dynamic settingsJson = JObject.Parse(File.ReadAllText(settingsFilePath));

            if (settingsJson.Version.ToString().Equals("1.0.0", StringComparison.InvariantCultureIgnoreCase))
            {
                var botClientJson = settingsJson["BotClient"] as JObject;

                var monitoredChannels = !string.IsNullOrWhiteSpace(botClientJson.GetValue("MonitoredChannels").ToString())
                    ? botClientJson.GetValue("MonitoredChannels").ToString().Split(" ").Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim())
                    : Array.Empty<string>();

                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("MonitoredChannels", JToken.FromObject(monitoredChannels));
                ((JObject)settingsJson["BotClient"]).Remove("MonitoredChannels");

                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("TvShowRoles", JToken.FromObject(Array.Empty<string>()));
                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("MovieRoles", JToken.FromObject(Array.Empty<string>()));

                settingsJson.ChatClients.Discord.EnableDirectMessageSupport = false;

                ((JObject)settingsJson["DownloadClients"]["Ombi"]).Add("BaseUrl", string.Empty);

                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Add("BaseUrl", string.Empty);
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Add("SearchNewRequests", true);
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Add("MonitorNewRequests", true);

                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Add("BaseUrl", string.Empty);
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Add("SearchNewRequests", true);
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Add("MonitorNewRequests", true);

                settingsJson.Version = "1.0.1";
                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.0.1", StringComparison.InvariantCultureIgnoreCase)
            || settingsJson.Version.ToString().Equals("1.0.2", StringComparison.InvariantCultureIgnoreCase)
            || settingsJson.Version.ToString().Equals("1.0.3", StringComparison.InvariantCultureIgnoreCase)
            || settingsJson.Version.ToString().Equals("1.0.4", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.0.5";
                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.0.5", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.0.6";
                ((JObject)settingsJson).Add("Port", 5060);
                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.0.6", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.0.9";

                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("AutomaticallyNotifyRequesters", true);
                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("NotificationMode", "PrivateMessages");
                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("NotificationChannels", JToken.FromObject(Array.Empty<int>()));
                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("AutomaticallyPurgeCommandMessages", false);
                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("DisplayHelpCommandInDMs", true);
                ((JObject)settingsJson["ChatClients"]["Discord"]).Add("EnableRequestsThroughDirectMessages", (bool)((JObject)settingsJson["ChatClients"]["Discord"]).GetValue("EnableDirectMessageSupport"));
                ((JObject)settingsJson["ChatClients"]["Discord"]).Remove("EnableDirectMessageSupport");

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.0.9", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.10.0";
                ((JObject)settingsJson["TvShows"]).Add("Restrictions", "None");

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.10.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.11.0";
                ((JObject)settingsJson).Add("BaseUrl", string.Empty);

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.11.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.12.0";

                ((JObject)settingsJson["DownloadClients"]).Add("Overseerr", JToken.FromObject(new OverseerrSettings()));

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.12.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.13.0";

                ((JObject)settingsJson["ChatClients"]).Add("Language", "english");

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.13.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.14.0";

                if (((JObject)settingsJson["Movies"]).TryGetValue("Command", StringComparison.InvariantCultureIgnoreCase, out _))
                {
                    ((JObject)settingsJson["ChatClients"]["Discord"]).Remove("DisplayHelpCommandInDMs");
                    ((JObject)settingsJson["BotClient"]).Remove("CommandPrefix");

                    ((JObject)settingsJson["ChatClients"]["Discord"]).Remove("TvShowRoles");
                    ((JObject)settingsJson["ChatClients"]["Discord"]).Add("TvShowRoles", JToken.FromObject(Array.Empty<int>()));

                    ((JObject)settingsJson["ChatClients"]["Discord"]).Remove("MovieRoles");
                    ((JObject)settingsJson["ChatClients"]["Discord"]).Add("MovieRoles", JToken.FromObject(Array.Empty<int>()));

                    ((JObject)settingsJson["ChatClients"]["Discord"]).Remove("NotificationChannels");
                    ((JObject)settingsJson["ChatClients"]["Discord"]).Add("NotificationChannels", JToken.FromObject(Array.Empty<int>()));

                    ((JObject)settingsJson["ChatClients"]["Discord"]).Remove("MonitoredChannels");
                    ((JObject)settingsJson["ChatClients"]["Discord"]).Add("MonitoredChannels", JToken.FromObject(Array.Empty<int>()));

                    ((JObject)settingsJson["Movies"]).Remove("Command");
                    ((JObject)settingsJson["TvShows"]).Remove("Command");
                }

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.14.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "1.15.0";

                ((JObject)settingsJson).Add("DisableAuthentication", false);

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("1.15.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "2.0.0";

                var radarrCategories = new[]
                {
                    new RadarrCategory
                    {
                        Id = 0,
                        Name = "movie",
                        ProfileId = (int)((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("MovieProfileId"),
                        RootFolder = (string)((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("MovieRootFolder"),
                        MinimumAvailability = (string)((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("MovieMinimumAvailability"),
                        Tags = ((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("MovieTags").ToObject<int[]>()
                    },
                    new RadarrCategory
                    {
                        Id = 1,
                        Name = "movie-anime",
                        ProfileId = (int)((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("AnimeProfileId"),
                        RootFolder = (string)((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("AnimeRootFolder"),
                        MinimumAvailability = (string)((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("AnimeMinimumAvailability"),
                        Tags = ((JObject)settingsJson["DownloadClients"]["Radarr"]).GetValue("AnimeTags").ToObject<int[]>()
                    },
                };

                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("MovieProfileId");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("MovieRootFolder");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("MovieMinimumAvailability");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("MovieTags");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("AnimeProfileId");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("AnimeRootFolder");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("AnimeMinimumAvailability");
                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Remove("AnimeTags");

                ((JObject)settingsJson["DownloadClients"]["Radarr"]).Add("Categories", JToken.FromObject(radarrCategories));

                var sonarrCategories = new[]
                {
                    new SonarrCategory
                    {
                        Id = 0,
                        Name = "tv",
                        ProfileId = (int)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("TvProfileId"),
                        RootFolder = (string)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("TvRootFolder"),
                        Tags = ((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("TvTags").ToObject<int[]>(),
                        LanguageId = (int)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("TvLanguageId"),
                        UseSeasonFolders = (bool)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("TvUseSeasonFolders"),
                        SeriesType = "standard",
                    },
                    new SonarrCategory
                    {
                        Id = 1,
                        Name = "tv-anime",
                        ProfileId = (int)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("AnimeProfileId"),
                        RootFolder = (string)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("AnimeRootFolder"),
                        Tags = ((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("AnimeTags").ToObject<int[]>(),
                        LanguageId = (int)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("AnimeLanguageId"),
                        UseSeasonFolders = (bool)((JObject)settingsJson["DownloadClients"]["Sonarr"]).GetValue("AnimeUseSeasonFolders"),
                        SeriesType = "anime",
                    },
                };

                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("TvProfileId");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("TvRootFolder");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("TvTags");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("TvLanguageId");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("TvUseSeasonFolders");

                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("AnimeProfileId");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("AnimeRootFolder");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("AnimeTags");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("AnimeLanguageId");
                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Remove("AnimeUseSeasonFolders");

                ((JObject)settingsJson["DownloadClients"]["Sonarr"]).Add("Categories", JToken.FromObject(sonarrCategories));

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("2.0.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "2.1.0";

                var defaultApiUserID = (string)((JObject)settingsJson["DownloadClients"]["Overseerr"]).GetValue("DefaultApiUserID");
                ((JObject)settingsJson["DownloadClients"]["Overseerr"]).Remove("DefaultApiUserID");

                ((JObject)settingsJson["DownloadClients"]["Overseerr"]).Add("Movies", JToken.FromObject(new OverseerrMovieSettings { DefaultApiUserId = defaultApiUserID }));
                ((JObject)settingsJson["DownloadClients"]["Overseerr"]).Add("TvShows", JToken.FromObject(new OverseerrTvShowSettings { DefaultApiUserId = defaultApiUserID }));

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("2.1.0", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "2.1.1";

                ((JObject)settingsJson["DownloadClients"]["Overseerr"]).Add("UseMovieIssue", false);
                ((JObject)settingsJson["DownloadClients"]["Overseerr"]).Add("UseTVIssue", false);

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("2.1.1", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "2.1.2";

                ((JObject)settingsJson["DownloadClients"]["Ombi"]).Add("UseMovieIssue", false);
                ((JObject)settingsJson["DownloadClients"]["Ombi"]).Add("UseTVIssue", false);

                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }

            if (settingsJson.Version.ToString().Equals("2.1.2", StringComparison.InvariantCultureIgnoreCase))
            {
                settingsJson.Version = "2.1.3";

                LidarrSettings lidarrBlankSettings = new LidarrSettings
                {
                    Hostname = string.Empty,
                    Port = 8686,
                    ApiKey = string.Empty,
                    BaseUrl = string.Empty,
                    Categories = new LidarrCategory[] {
                        new LidarrCategory {
                            Id = 0,
                            Name = "music",
                            ProfileId = 1,
                            MetadataProfileId = 1,
                            RootFolder = string.Empty,
                            Tags = Array.Empty<int>(),
                        }
                    },
                    SearchNewRequests = true,
                    MonitorNewRequests = true,
                    UseSSL = false,
                    Version = "1"
                };

                var musicClient = new
                {
                    Client = "Disabled"
                };

                ((JObject)settingsJson["DownloadClients"]).Add("Lidarr", JToken.FromObject(lidarrBlankSettings));
                ((JObject)settingsJson).Add("Music", JToken.FromObject(musicClient));
                ((JObject)settingsJson.ChatClients.Discord).Add("MusicRoles", JToken.FromObject(new List<string>()));
                File.WriteAllText(settingsFilePath, JsonConvert.SerializeObject(settingsJson));
            }
        }
    }
}