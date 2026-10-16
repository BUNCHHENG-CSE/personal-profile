import { describe, expect, it } from "vitest";
import { cleanSteamInput, parseSteamXml } from "../lib/steam";

describe("steam helper", () => {
  it("cleans steam inputs accurately", () => {
    expect(cleanSteamInput("")).toBeNull();
    expect(cleanSteamInput("   ")).toBeNull();
    expect(cleanSteamInput("76561197960287930")).toEqual({
      type: "profiles",
      value: "76561197960287930",
    });
    expect(cleanSteamInput("https://steamcommunity.com/profiles/76561197960287930/")).toEqual({
      type: "profiles",
      value: "76561197960287930",
    });
    expect(cleanSteamInput("gabelogannewell")).toEqual({
      type: "id",
      value: "gabelogannewell",
    });
    expect(cleanSteamInput("https://steamcommunity.com/id/gabelogannewell/")).toEqual({
      type: "id",
      value: "gabelogannewell",
    });
  });

  it("parses Steam profile XML correctly", () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<profile>
	<steamID64>76561197960287930</steamID64>
	<steamID><![CDATA[Gabe Newell]]></steamID>
	<onlineState>in-game</onlineState>
	<stateMessage><![CDATA[In-Game<br/>Dota 2]]></stateMessage>
	<avatarFull><![CDATA[https://avatars.steamstatic.com/sample_full.jpg]]></avatarFull>
	<customURL><![CDATA[gabelogannewell]]></customURL>
	<inGameInfo>
		<gameName><![CDATA[Dota 2]]></gameName>
		<gameLink><![CDATA[https://steamcommunity.com/app/570]]></gameLink>
		<gameIcon><![CDATA[https://cdn.steamstatic.com/dota2.jpg]]></gameIcon>
	</inGameInfo>
	<mostPlayedGames>
		<mostPlayedGame>
			<gameName><![CDATA[Dota 2]]></gameName>
			<gameLink><![CDATA[https://steamcommunity.com/app/570]]></gameLink>
			<gameIcon><![CDATA[https://cdn.steamstatic.com/dota2_icon.jpg]]></gameIcon>
			<hoursPlayed>45.5</hoursPlayed>
			<hoursOnRecord>4,500.2</hoursOnRecord>
		</mostPlayedGame>
	</mostPlayedGames>
</profile>`;

    const parsed = parseSteamXml(sampleXml);
    expect(parsed).not.toBeNull();
    expect(parsed?.steamId64).toBe("76561197960287930");
    expect(parsed?.personaName).toBe("Gabe Newell");
    expect(parsed?.onlineState).toBe("in-game");
    expect(parsed?.profileUrl).toBe("https://steamcommunity.com/id/gabelogannewell");
    expect(parsed?.currentGame?.name).toBe("Dota 2");
    expect(parsed?.mostPlayedGames?.length).toBe(1);
    expect(parsed?.mostPlayedGames?.[0].name).toBe("Dota 2");
    expect(parsed?.mostPlayedGames?.[0].hoursTotal).toBe("4,500.2");
  });

  it("returns null for malformed or missing XML", () => {
    expect(parseSteamXml("<error>Profile not found</error>")).toBeNull();
    expect(parseSteamXml("not xml at all")).toBeNull();
  });
});
