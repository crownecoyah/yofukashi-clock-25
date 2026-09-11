import AppKit
import SwiftUI

struct DigitalClockFontSelection: Codable, Equatable {
    // Empty names denote the system font, which follows the current macOS.
    var family = ""
    var face = ""
    var postScriptName = ""
    var size: Double = 42

    static let standard = DigitalClockFontSelection()
    static let sizeRange: ClosedRange<Double> = 10...144
}

struct DigitalClockFontFace: Identifiable, Equatable {
    let postScriptName: String
    let name: String
    let weight: Int
    var id: String { postScriptName }
}

@MainActor
final class DigitalClockFontSettings: ObservableObject {
    static let storageKey = "digitalClockFont"
    @Published private(set) var selection: DigitalClockFontSelection
    @Published private(set) var families: [String] = []
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        selection = defaults.data(forKey: Self.storageKey)
            .flatMap { try? JSONDecoder().decode(DigitalClockFontSelection.self, from: $0) } ?? .standard
        refreshAvailableFonts()
    }

    var font: Font {
        guard !selection.postScriptName.isEmpty,
              NSFont(name: selection.postScriptName, size: selection.size) != nil else {
            return .system(size: selection.size)
        }
        return .custom(selection.postScriptName, size: selection.size)
    }

    func faces(in family: String) -> [DigitalClockFontFace] {
        let members = NSFontManager.shared.availableMembers(ofFontFamily: family) ?? []
        return members.compactMap { member in
            guard member.count >= 3, let name = member[0] as? String,
                  let face = member[1] as? String,
                  NSFont(name: name, size: selection.size) != nil else { return nil }
            return DigitalClockFontFace(postScriptName: name, name: face,
                                        weight: (member[2] as? NSNumber)?.intValue ?? 5)
        }.sorted {
            if $0.weight != $1.weight { return $0.weight < $1.weight }
            return $0.name.localizedStandardCompare($1.name) == .orderedAscending
        }
    }

    func selectFamily(_ family: String) {
        if family.isEmpty {
            update(.init(size: selection.size))
            return
        }
        let members = faces(in: family)
        guard let face = members.first(where: { $0.name == selection.face })
                ?? members.first(where: { ["Regular", "Normal", "Roman", "Book"].contains($0.name) })
                ?? members.first else { return }
        update(.init(family: family, face: face.name, postScriptName: face.postScriptName, size: selection.size))
    }

    func selectFace(_ postScriptName: String) {
        guard let face = faces(in: selection.family).first(where: { $0.postScriptName == postScriptName }) else { return }
        var value = selection
        value.face = face.name
        value.postScriptName = face.postScriptName
        update(value)
    }

    func setSize(_ size: Double) {
        var value = selection
        value.size = size
        update(value)
    }

    func reset() { update(.standard) }

    func refreshAvailableFonts() {
        families = NSFontManager.shared.availableFontFamilies.sorted {
            $0.localizedStandardCompare($1) == .orderedAscending
        }
        update(selection)
    }

    private func update(_ proposed: DigitalClockFontSelection) {
        var value = proposed
        value.size = value.size.isFinite
            ? min(max(value.size, DigitalClockFontSelection.sizeRange.lowerBound), DigitalClockFontSelection.sizeRange.upperBound)
            : DigitalClockFontSelection.standard.size
        if value.postScriptName.isEmpty {
            value.family = ""
            value.face = ""
        } else if let font = NSFont(name: value.postScriptName, size: value.size) {
            // The PostScript name is authoritative when restoring a selection.
            value.family = font.familyName ?? value.family
            value.face = faces(in: value.family).first(where: { $0.postScriptName == value.postScriptName })?.name ?? value.face
        } else {
            value = .standard
        }
        if selection != value { selection = value }
        if let data = try? JSONEncoder().encode(value) {
            defaults.set(data, forKey: Self.storageKey)
        }
    }
}
