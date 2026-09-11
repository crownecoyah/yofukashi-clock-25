import AppKit
import SwiftUI
import XCTest
@testable import NightOwlClock25

final class DigitalClockFontSettingsTests: XCTestCase {
    private var defaults: UserDefaults!
    private var suite: String!

    override func setUp() {
        suite = "DigitalClockFontSettingsTests.\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suite)!
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suite)
        defaults = nil
    }

    @MainActor
    func testFamilyFaceAndSizeSurviveRelaunch() throws {
        let settings = DigitalClockFontSettings(defaults: defaults)
        let family = try XCTUnwrap(settings.families.first { settings.faces(in: $0).count > 1 })
        settings.selectFamily(family)
        let face = try XCTUnwrap(settings.faces(in: family).last)
        settings.selectFace(face.postScriptName)
        settings.setSize(57)

        let restored = DigitalClockFontSettings(defaults: defaults)
        XCTAssertEqual(restored.selection, settings.selection)
        XCTAssertEqual(restored.selection.family, family)
        XCTAssertEqual(restored.selection.face, face.name)
        XCTAssertEqual(restored.selection.postScriptName, face.postScriptName)
        XCTAssertEqual(restored.selection.size, 57)
        XCTAssertNotNil(NSFont(name: restored.selection.postScriptName, size: restored.selection.size))
    }

    @MainActor
    func testMissingFontFallsBackAndPersistsSystemDefault() throws {
        let missing = DigitalClockFontSelection(family: "Removed Family", face: "Bold",
                                               postScriptName: "MissingFont-\(UUID().uuidString)", size: 88)
        defaults.set(try JSONEncoder().encode(missing), forKey: DigitalClockFontSettings.storageKey)
        let settings = DigitalClockFontSettings(defaults: defaults)
        XCTAssertEqual(settings.selection, .standard)
        XCTAssertEqual(DigitalClockFontSettings(defaults: defaults).selection, .standard)
    }

    @MainActor
    func testResetAndSizeLimits() throws {
        let settings = DigitalClockFontSettings(defaults: defaults)
        let family = try XCTUnwrap(settings.families.first { !settings.faces(in: $0).isEmpty })
        settings.selectFamily(family)
        settings.setSize(9999)
        XCTAssertEqual(settings.selection.size, 144)
        settings.setSize(-1)
        XCTAssertEqual(settings.selection.size, 10)
        settings.setSize(.nan)
        XCTAssertEqual(settings.selection.size, 42)
        settings.reset()
        XCTAssertEqual(settings.selection, .standard)
        XCTAssertEqual(DigitalClockFontSettings(defaults: defaults).selection, .standard)
    }

    @MainActor
    func testPostScriptNameOverridesStaleDisplayNames() throws {
        let font = try XCTUnwrap(NSFont(name: "Helvetica-Bold", size: 42))
        let stored = DigitalClockFontSelection(family: "Stale Family", face: "Stale Face",
                                              postScriptName: font.fontName, size: 42)
        defaults.set(try JSONEncoder().encode(stored), forKey: DigitalClockFontSettings.storageKey)
        let settings = DigitalClockFontSettings(defaults: defaults)
        XCTAssertEqual(settings.selection.family, font.familyName)
        XCTAssertEqual(settings.selection.postScriptName, font.fontName)
        XCTAssertNotEqual(settings.selection.face, "Stale Face")
    }

    @MainActor
    func testMalformedStoredSettingsUseDefault() {
        defaults.set(Data("invalid".utf8), forKey: DigitalClockFontSettings.storageKey)
        XCTAssertEqual(DigitalClockFontSettings(defaults: defaults).selection, .standard)
    }

    @MainActor
    func testClockKeepsExtendedHoursAndSecondsToggle() throws {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "Asia/Tokyo")!
        let date = try XCTUnwrap(calendar.date(from: DateComponents(year: 2027, month: 7, day: 8,
                                                                   hour: 1, minute: 25, second: 38)))
        let logical = try LogicalDateTimeConverter(calendar: calendar).logicalDateTime(from: date, boundaryHour: 5)
        let withSeconds = DigitalClockView(date: date, boundaryHour: 5, showsSeconds: true)
        let withoutSeconds = DigitalClockView(date: date, boundaryHour: 5, showsSeconds: false)
        XCTAssertEqual(withSeconds.dateText(logical), "2027年07月07日")
        XCTAssertEqual(withSeconds.timeText(logical), "25:25:38")
        XCTAssertEqual(withoutSeconds.timeText(logical), "25:25")
    }

    @MainActor
    func testLargeFontRendersWithinMinimumWindowContentWidth() throws {
        let settings = DigitalClockFontSettings(defaults: defaults)
        settings.selectFamily("Helvetica")
        settings.selectFace("Helvetica-Bold")
        settings.setSize(144)
        let date = try XCTUnwrap(Calendar.autoupdatingCurrent.date(from: DateComponents(
            year: 2027, month: 7, day: 8, hour: 1, minute: 25, second: 38)))
        // 480 pt minimum window width minus the dashboard's 28 pt padding per side.
        let renderer = ImageRenderer(content: DigitalClockView(date: date, boundaryHour: 5, showsSeconds: true)
            .environmentObject(settings).frame(width: 424).padding(8).background(.white))
        renderer.scale = 1
        let image = try XCTUnwrap(renderer.cgImage)
        XCTAssertEqual(image.width, 440)
        XCTAssertLessThan(image.height, 400)
        let bitmap = NSBitmapImageRep(cgImage: image)
        let png = try XCTUnwrap(bitmap.representation(using: .png, properties: [:]))
        try png.write(to: URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent("NightOwlClock25-font-preview.png"))
        print("Font preview: \(NSTemporaryDirectory())NightOwlClock25-font-preview.png")
    }
}
