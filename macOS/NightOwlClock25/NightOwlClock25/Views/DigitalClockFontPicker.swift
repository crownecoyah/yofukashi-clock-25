import SwiftUI

struct DigitalClockFontPicker: View {
    @EnvironmentObject private var settings: DigitalClockFontSettings
    @Environment(\.dismiss) private var dismiss
    @State private var search = ""

    private var filteredFamilies: [String] {
        settings.families.filter { search.isEmpty || $0.localizedCaseInsensitiveContains(search) }
    }

    private var previewDate: Date {
        Calendar.autoupdatingCurrent.date(from: DateComponents(year: 2027, month: 7, day: 8,
                                                               hour: 1, minute: 25, second: 38))!
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("デジタル時計のフォント").font(.headline)
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading) {
                    TextField("フォントファミリーを検索", text: $search)
                    List(selection: Binding<String?>(get: { settings.selection.family },
                                                     set: { if let family = $0 { settings.selectFamily(family) } })) {
                        Text("システム標準").tag("")
                        ForEach(filteredFamilies, id: \.self) { family in
                            Text(family).tag(family)
                        }
                    }
                    .accessibilityLabel("フォントファミリー")
                }
                .frame(maxWidth: .infinity)

                VStack(alignment: .leading, spacing: 12) {
                    Text(settings.selection.family.isEmpty ? "システム標準" : settings.selection.family)
                        .lineLimit(2)
                    Picker("書体", selection: Binding(get: { settings.selection.postScriptName },
                                                      set: { settings.selectFace($0) })) {
                        if settings.selection.postScriptName.isEmpty {
                            Text("Regular").tag("")
                        }
                        ForEach(settings.faces(in: settings.selection.family)) { face in
                            Text(face.name).tag(face.postScriptName)
                        }
                    }
                    .disabled(settings.selection.postScriptName.isEmpty)
                    HStack {
                        Text("サイズ")
                        TextField("フォントサイズ", value: Binding(get: { settings.selection.size },
                                                                              set: { settings.setSize($0) }),
                                  format: .number)
                            .frame(width: 64)
                        Text("pt")
                    }
                    Slider(value: Binding(get: { settings.selection.size }, set: { settings.setSize($0) }),
                           in: DigitalClockFontSelection.sizeRange, step: 1)
                        .accessibilityLabel("フォントサイズ")
                    Text("10〜144 pt。幅に収まらない場合は自動的に縮小します。")
                        .font(.caption).foregroundStyle(.secondary)
                    Button("標準に戻す") { settings.reset() }
                }
                .frame(width: 220)
            }
            .frame(height: 230)

            Text("プレビュー（日付・時刻共通）").font(.subheadline)
            ScrollView {
                DigitalClockView(date: previewDate, boundaryHour: 5, showsSeconds: true)
                    .padding(12)
            }
            .frame(height: 170)
            .background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
            HStack {
                Text("変更は自動的に保存されます。")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Button("完了") { dismiss() }.keyboardShortcut(.defaultAction)
            }
        }
        .padding(20)
        .frame(width: 600)
        .onAppear { settings.refreshAvailableFonts() }
    }
}
