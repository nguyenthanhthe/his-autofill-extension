// ==UserScript==
// @name         HIS V2 - Bảng Điều Khiển Cấu Hình & Tự Động Điền Khám Sức Khỏe
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  Bảng giao diện tương tác cho bác sĩ tùy biến: Chiều cao, Cân nặng, Mạch, Huyết áp, Phân loại sức khỏe, Thị lực mắt, Bác sĩ khám & Kết luận tự động lưu trên hệ thống v20.ytecoso.vn
// @author       ThanhThe
// @match        https://v20.ytecoso.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG_KEY = 'his_v2_autofill_config_v5';

    const defaultCfg = {
        height: '150',
        weight: '48',
        pulse: '80',
        bp: '100/60',
        theLucRadio: 'Loại 2',
        matPhai: '6',
        matTrai: '7',
        coKinhPhai: '',
        coKinhTrai: '',
        docNgoaiDa: '06',
        docMatTmhRhm: '24',
        docKhac: '04',
        skipSanPhuKhoa: true,
        plKetLuan: 'Loại II: Khỏe',
        docKetLuan: '02',
        gioKetThuc: '07:45',
        autoSave: true
    };

    function loadConfig() {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
            if (saved) return Object.assign({}, defaultCfg, JSON.parse(saved));
        } catch (e) {
            console.warn('Không thể đọc config từ localStorage:', e);
        }
        return Object.assign({}, defaultCfg);
    }

    function saveConfig(cfg) {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
        } catch (e) {
            console.warn('Không thể lưu config vào localStorage:', e);
        }
    }

    const delay = ms => new Promise(r => setTimeout(r, ms));

    const setAngularValue = (el, value) => {
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    };

    const clickMainTab = async (tabName) => {
        const tabs = Array.from(document.querySelectorAll('.tab-app-main .ant-tabs-tab, .ant-tabs-tab'));
        const tab = tabs.find(t => t.innerText.trim() === tabName || t.innerText.includes(tabName));
        if (tab) {
            tab.click();
            await delay(350);
            return true;
        }
        return false;
    };

    const clickSubTab = async (tabName) => {
        const tabs = Array.from(document.querySelectorAll('.vertical-tabs .ant-tabs-tab, .ant-tabs-tab'));
        const tab = tabs.find(t => t.innerText.trim() === tabName || t.innerText.includes(tabName));
        if (tab) {
            tab.click();
            await delay(250);
            return true;
        }
        return false;
    };

    const selectOption = async (selectEl, textMatch, fallback = '') => {
        if (!selectEl) return false;
        const topControl = selectEl.querySelector('nz-select-top-control') || selectEl;
        topControl.click();
        await delay(120);

        const input = selectEl.querySelector('.ant-select-selection-search-input');
        if (input) {
            input.focus();
            input.value = textMatch;
            input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
            input.dispatchEvent(new KeyboardEvent('keydown', { key: textMatch[0] || 'a', bubbles: true }));
            input.dispatchEvent(new KeyboardEvent('keyup', { key: textMatch[0] || 'a', bubbles: true }));
        }

        for (let i = 0; i < 25; i++) {
            await delay(80);
            const options = Array.from(document.querySelectorAll('.ant-select-item-option'));
            const match = options.find(o => {
                const txt = o.innerText.toLowerCase();
                return txt.includes(textMatch.toLowerCase()) || (fallback && txt.includes(fallback.toLowerCase()));
            });
            if (match) {
                match.click();
                await delay(120);
                return true;
            }
        }
        document.body.click();
        return false;
    };

    // ĐIỀN CẤU HÌNH TIẾP ĐÓN (ĐÃ SỬA LỖI ĐỊNH VỊ PANE)
    async function fillTiepDonConfig(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang điền cấu hình Tiếp đón...';

        await clickMainTab('Tiếp đón khám sức khoẻ');
        await delay(350);

        // Tìm chính xác pane Tiếp đón dựa trên input tên đầy đủ
        const nameInput = document.querySelector('input[name="tenDayDu"]');
        const pane = nameInput ? nameInput.closest('.ant-tabs-tabpane') : (document.querySelector('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active') || document);

        const timeInputs = Array.from(pane.querySelectorAll('input[placeholder="__:__"]'));
        if (timeInputs[0]) setAngularValue(timeInputs[0], "07:30");

        const selects = Array.from(pane.querySelectorAll('nz-select'));

        if (selects[6]) await selectOption(selects[6], "00000", "Khác, Không xác định");
        if (selects[10]) await selectOption(selects[10], "từ đủ 18 tuổi trở lên");
        if (selects[11]) await selectOption(selects[11], "Các đối tượng khác");
        if (selects[12]) await selectOption(selects[12], "Xã hội hoá");

        const taLyDo = pane.querySelector('textarea[name="lyDoVaoVien"]') || pane.querySelector('textarea');
        if (taLyDo) setAngularValue(taLyDo, "Khám sức khoẻ định kỳ");

        if (statusEl) statusEl.innerText = '✅ Đã điền xong Tiếp đón (Nghề nghiệp, Mẫu KSK, Đối tượng, Kinh phí, Lý do)!';
    }

    // ĐIỀN TOÀN BỘ THEO CẤU HÌNH TỪ GIAO DIỆN
    async function fillKhamTheoBangGiaoDien(statusEl) {
        const cfg = readConfigFromUI();
        saveConfig(cfg);

        if (statusEl) statusEl.innerText = '⏳ Đang mở Khám sức khỏe định kỳ...';
        await clickMainTab('Khám sức khỏe định kỳ');

        // 1. ĐIỀN THỂ LỰC
        if (cfg.height || cfg.weight || cfg.pulse || cfg.bp) {
            if (statusEl) statusEl.innerText = `⏳ Đang điền Thể lực (Cao ${cfg.height}cm, Nặng ${cfg.weight}kg, Mạch ${cfg.pulse}, HA ${cfg.bp})...`;
            await clickSubTab('THỂ LỰC');
            const paneTL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;
            const inputsTL = Array.from(paneTL.querySelectorAll('input'));

            if (cfg.height && inputsTL[0]) setAngularValue(inputsTL[0], cfg.height);
            if (cfg.weight && inputsTL[1]) setAngularValue(inputsTL[1], cfg.weight);
            if (cfg.pulse && inputsTL[3]) setAngularValue(inputsTL[3], cfg.pulse);

            const bpHolder = paneTL.querySelector('input[name="huyet_ap"]') || inputsTL[4];
            if (cfg.bp && bpHolder) setAngularValue(bpHolder, cfg.bp);

            if (cfg.theLucRadio) {
                const radiosTL = Array.from(paneTL.querySelectorAll('.ant-radio-wrapper'));
                const targetRadio = radiosTL.find(r => r.innerText.includes(cfg.theLucRadio));
                if (targetRadio && !targetRadio.classList.contains('ant-radio-wrapper-checked')) {
                    targetRadio.click();
                }
            }
            await delay(250);
        }

        // 2. ĐIỀN KHÁM LÂM SÀNG
        if (statusEl) statusEl.innerText = '⏳ Đang điền Khám Lâm Sàng...';
        await clickSubTab('KHÁM LÂM SÀNG');
        const paneLS = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        const textareasLS = Array.from(paneLS.querySelectorAll('textarea'));
        const defaultTexts = [
            "T1T2 đều rõ không có tiếng bệnh lý",                               // 0: Tuần hoàn
            "Lồng ngực cân đối di động đều theo nhịp thở,phổi không có ral",   // 1: Hô hấp
            "Bụng mềm không chướng,gan lách không to",                          // 2: Tiêu hóa
            "Hiện tại bình thường",                                             // 3: Thận - Tiết niệu
            "Hiện tại bình thường",                                             // 4: Nội tiết
            "Hiện tại bình thường",                                             // 5: Cơ - Xương - Khớp
            "Không có dấu hiệu liệt thần kinh khu trú",                         // 6: Thần kinh
            "Không có dấu hiệu tâm thần kinh",                                  // 7: Tâm thần
            "Hiện tại bình thường",                                             // 8: Ngoại khoa
            "Hiện tại bình thường",                                             // 9: Da liễu
            "",                                                                 // 10: Sản phụ khoa
            "Hiện tại bình thường",                                             // 11: Mắt khác
            "Hiện tại bình thường",                                             // 12: TMH
            "Bình thường",                                                      // 13: Hàm trên
            "Bình thường",                                                      // 14: Hàm dưới
            "Hiện tại bình thường"                                              // 15: RHM
        ];
        for (let i = 0; i < defaultTexts.length; i++) {
            if (i === 10 && cfg.skipSanPhuKhoa) continue;
            if (textareasLS[i]) setAngularValue(textareasLS[i], defaultTexts[i]);
        }

        const inpKKPhai = paneLS.querySelector('input[name="khong_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[0];
        const inpKKTrai = paneLS.querySelector('input[name="khong_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[1];
        const inpCKPhai = paneLS.querySelector('input[name="co_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[2];
        const inpCKTrai = paneLS.querySelector('input[name="co_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[3];

        if (inpKKPhai) setAngularValue(inpKKPhai, cfg.matPhai || "6");
        if (inpKKTrai) setAngularValue(inpKKTrai, cfg.matTrai || "7");
        if (inpCKPhai) setAngularValue(inpCKPhai, cfg.coKinhPhai || "");
        if (inpCKTrai) setAngularValue(inpCKTrai, cfg.coKinhTrai || "");

        const inputsTai = Array.from(paneLS.querySelectorAll('input[placeholder="m"]'));
        if (inputsTai[0]) setAngularValue(inputsTai[0], "5");
        if (inputsTai[1]) setAngularValue(inputsTai[1], "0.5");
        if (inputsTai[2]) setAngularValue(inputsTai[2], "5");
        if (inputsTai[3]) setAngularValue(inputsTai[3], "0.5");

        const selectsLS = Array.from(paneLS.querySelectorAll('nz-select'));
        for (let i = 0; i < selectsLS.length; i += 2) {
            if (i === 20 && cfg.skipSanPhuKhoa) continue;

            if (selectsLS[i]) await selectOption(selectsLS[i], "Loại II: Khỏe");

            if (selectsLS[i + 1]) {
                let docCode = cfg.docKhac || "04";
                let docName = "Tô Chí Sơn";

                if (i === 16 || i === 18) {
                    docCode = cfg.docNgoaiDa || "06";
                    docName = "Mai Ngọc Tuấn";
                } else if (i === 22 || i === 24 || i === 26) {
                    docCode = cfg.docMatTmhRhm || "24";
                    docName = "Nguyễn Thị Dung";
                }

                await selectOption(selectsLS[i + 1], docCode, docName);
            }
        }

        // 3. ĐIỀN KẾT LUẬN
        if (statusEl) statusEl.innerText = '⏳ Đang điền Kết Luận...';
        await clickSubTab('KẾT LUẬN');
        const paneKL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        const cbsKL = Array.from(paneKL.querySelectorAll('.ant-checkbox-wrapper'));
        const targetCb = cbsKL.find(c => c.innerText.includes(cfg.plKetLuan) || (cfg.plKetLuan.includes('Loại II') && c.innerText.includes('Loại II')));
        if (targetCb && !targetCb.classList.contains('ant-checkbox-wrapper-checked')) {
            targetCb.click();
        }
        const otherCbs = cbsKL.filter(c => c !== targetCb && (c.innerText.includes('Loại I:') || c.innerText.includes('Loại II') || c.innerText.includes('Loại III') || c.innerText.includes('Loại IV') || c.innerText.includes('Loại V')));
        otherCbs.forEach(c => {
            if (c.classList.contains('ant-checkbox-wrapper-checked') && !c.innerText.includes(cfg.plKetLuan)) {
                c.click();
            }
        });

        const cbKetThuc = cbsKL.find(c => c.innerText.includes('Xác nhận kết thúc khám') || c.closest('div')?.innerText?.includes('Xác nhận kết thúc khám')) || cbsKL[cbsKL.length - 1];
        if (cbKetThuc && !cbKetThuc.classList.contains('ant-checkbox-wrapper-checked')) {
            cbKetThuc.click();
        }

        const selectsKL = Array.from(paneKL.querySelectorAll('nz-select'));
        const docSelectKL = selectsKL[1] || selectsKL[selectsKL.length - 1];
        if (docSelectKL) {
            await selectOption(docSelectKL, cfg.docKetLuan || "02", "Nguyễn Thị Nga");
        }

        const timeInput = paneKL.querySelector('input[placeholder="__:__"]');
        if (timeInput) {
            setAngularValue(timeInput, cfg.gioKetThuc || '07:45');
        }

        if (cfg.autoSave) {
            if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu...';
            await delay(350);
            const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lưu' || b.innerText.includes('Lưu (F11)'));
            if (saveBtn) {
                saveBtn.click();
                if (statusEl) statusEl.innerText = `✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU (Cao ${cfg.height}, Nặng ${cfg.weight}, Mạch ${cfg.pulse}, HA ${cfg.bp})!`;
            } else {
                if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG (Vui lòng bấm Lưu)!';
            }
        } else {
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG THEO THÔNG SỐ (Chưa bấm Lưu)!';
        }
    }

    function readConfigFromUI() {
        return {
            height: document.getElementById('cfg-height')?.value?.trim() || '150',
            weight: document.getElementById('cfg-weight')?.value?.trim() || '48',
            pulse: document.getElementById('cfg-pulse')?.value?.trim() || '80',
            bp: document.getElementById('cfg-bp')?.value?.trim() || '100/60',
            theLucRadio: document.getElementById('cfg-theluc-pl')?.value || 'Loại 2',
            matPhai: document.getElementById('cfg-mat-phai')?.value?.trim() || '6',
            matTrai: document.getElementById('cfg-mat-trai')?.value?.trim() || '7',
            coKinhPhai: document.getElementById('cfg-co-kinh-p')?.value?.trim() || '',
            coKinhTrai: document.getElementById('cfg-co-kinh-t')?.value?.trim() || '',
            docNgoaiDa: document.getElementById('cfg-doc-ngoai')?.value?.trim() || '06',
            docMatTmhRhm: document.getElementById('cfg-doc-mat')?.value?.trim() || '24',
            docKhac: document.getElementById('cfg-doc-khac')?.value?.trim() || '04',
            skipSanPhuKhoa: document.getElementById('cfg-skip-san')?.checked ?? true,
            plKetLuan: document.getElementById('cfg-pl-ketluan')?.value || 'Loại II: Khỏe',
            docKetLuan: document.getElementById('cfg-doc-ketluan')?.value?.trim() || '02',
            gioKetThuc: document.getElementById('cfg-gio-kt')?.value?.trim() || '07:45',
            autoSave: document.getElementById('cfg-auto-save')?.checked ?? true
        };
    }

    let isRunning = false;

    async function handleRunClick() {
        if (isRunning) return;
        isRunning = true;
        const statusEl = document.getElementById('his-panel-status');
        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.innerText = '⏳ Đang điền theo thông số...';
        }

        try {
            const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
            if (activeTopTab.includes('Tiếp đón')) {
                await fillTiepDonConfig(statusEl);
                await delay(500);
            }
            await fillKhamTheoBangGiaoDien(statusEl);
        } catch (e) {
            console.error('Lỗi tự động hóa:', e);
            if (statusEl) statusEl.innerText = '❌ Lỗi: ' + e.message;
        } finally {
            isRunning = false;
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.innerText = '🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)';
            }
        }
    }

    function mountControlPanel() {
        if (document.getElementById('his-tool-control-panel')) return;

        const cfg = loadConfig();

        const panel = document.createElement('div');
        panel.id = 'his-tool-control-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '15px';
        panel.style.right = '15px';
        panel.style.width = '420px';
        panel.style.backgroundColor = '#ffffff';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
        panel.style.zIndex = '2147483647';
        panel.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        panel.style.border = '2px solid #fa8c16';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #fa8c16, #ff7a45); color: white; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 13px;">
                <span>⚙️ BẢNG CẤU HÌNH & ĐIỀN TỰ ĐỘNG HIS V2</span>
                <div>
                    <button id="his-panel-reload-btn" title="Nạp lại bảng điều khiển" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 7px; margin-right: 4px;">🔄</button>
                    <button id="his-panel-toggle-btn" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 8px;">➖ Thu nhỏ</button>
                </div>
            </div>
            <div id="his-panel-body" style="padding: 12px; font-size: 12px; color: #262626; line-height: 1.4; max-height: 520px; overflow-y: auto;">
                
                <!-- 1. BẢNG THỂ LỰC -->
                <div style="background: #f0f5ff; border: 1px solid #adc6ff; padding: 8px 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <b style="color: #1d39c4; font-size: 12px;">🏋️ 1. THỂ LỰC (Bác sĩ tùy biến)</b>
                        <span style="font-size: 10px; color: #595959;">Tự động tính BMI</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">Cao (cm):</label>
                            <input id="cfg-height" type="text" value="${cfg.height}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 12px; text-align: center; color: #1d39c4;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Nặng (kg):</label>
                            <input id="cfg-weight" type="text" value="${cfg.weight}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 12px; text-align: center; color: #1d39c4;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Mạch (l/p):</label>
                            <input id="cfg-pulse" type="text" value="${cfg.pulse}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 12px; text-align: center; color: #cf1322;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Huyết áp:</label>
                            <input id="cfg-bp" type="text" value="${cfg.bp}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 12px; text-align: center; color: #cf1322;">
                        </div>
                    </div>
                    <div style="margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 11px; color: #595959;">Phân loại thể lực:</span>
                        <select id="cfg-theluc-pl" style="padding: 3px 6px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: bold; font-size: 11px; color: #1d39c4;">
                            <option value="Loại 1" ${cfg.theLucRadio === 'Loại 1' ? 'selected' : ''}>Loại 1 (Tốt)</option>
                            <option value="Loại 2" ${cfg.theLucRadio === 'Loại 2' ? 'selected' : ''}>Loại 2 (Khá)</option>
                            <option value="Loại 3" ${cfg.theLucRadio === 'Loại 3' ? 'selected' : ''}>Loại 3 (Trung bình)</option>
                            <option value="Loại 4" ${cfg.theLucRadio === 'Loại 4' ? 'selected' : ''}>Loại 4 (Yếu)</option>
                        </select>
                    </div>
                </div>

                <!-- 2. BẢNG KHÁM LÂM SÀNG -->
                <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 8px 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <b style="color: #389e0d; font-size: 12px;">🩺 2. KHÁM LÂM SÀNG & MẮT</b>
                        <label style="font-size: 11px; color: #d4380d; cursor: pointer;">
                            <input id="cfg-skip-san" type="checkbox" ${cfg.skipSanPhuKhoa ? 'checked' : ''}> Bỏ sản phụ khoa
                        </label>
                    </div>
                    <!-- Thị lực mắt -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-bottom: 6px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">Mắt P (k kính):</label>
                            <input id="cfg-mat-phai" type="text" value="${cfg.matPhai}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 11px; text-align: center;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Mắt T (k kính):</label>
                            <input id="cfg-mat-trai" type="text" value="${cfg.matTrai}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 11px; text-align: center;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Có kính P:</label>
                            <input id="cfg-co-kinh-p" type="text" value="${cfg.coKinhPhai}" placeholder="Trống" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 11px; text-align: center;">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Có kính T:</label>
                            <input id="cfg-co-kinh-t" type="text" value="${cfg.coKinhTrai}" placeholder="Trống" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 11px; text-align: center;">
                        </div>
                    </div>
                    <!-- Bác sĩ chuyên khoa -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; font-size: 11px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">BS Ngoại/Da:</label>
                            <input id="cfg-doc-ngoai" type="text" value="${cfg.docNgoaiDa}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center;" title="BS 06 (Mai Ngọc Tuấn)">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">BS Mắt/TMH/RHM:</label>
                            <input id="cfg-doc-mat" type="text" value="${cfg.docMatTmhRhm}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center;" title="BS 24 (Nguyễn Thị Dung)">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">BS Khoa khác:</label>
                            <input id="cfg-doc-khac" type="text" value="${cfg.docKhac}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; text-align: center;" title="BS 04 (Tô Chí Sơn)">
                        </div>
                    </div>
                </div>

                <!-- 3. BẢNG KẾT LUẬN -->
                <div style="background: #fff7e6; border: 1px solid #ffd591; padding: 8px 10px; border-radius: 8px; margin-bottom: 10px;">
                    <b style="color: #d46b08; font-size: 12px;">📋 3. KẾT LUẬN & HOÀN TẤT</b>
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 6px; margin-top: 6px;">
                        <div>
                            <label style="font-size: 10px; color: #595959;">Phân loại KSK:</label>
                            <select id="cfg-pl-ketluan" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #d9d9d9; font-weight: bold; font-size: 11px;">
                                <option value="Loại I: Rất khỏe" ${cfg.plKetLuan.includes('Loại I:') ? 'selected' : ''}>Loại I: Rất khỏe</option>
                                <option value="Loại II: Khỏe" ${cfg.plKetLuan.includes('Loại II') ? 'selected' : ''}>Loại II: Khỏe</option>
                                <option value="Loại III: Trung bình" ${cfg.plKetLuan.includes('Loại III') ? 'selected' : ''}>Loại III: Trung bình</option>
                                <option value="Loại IV: Yếu" ${cfg.plKetLuan.includes('Loại IV') ? 'selected' : ''}>Loại IV: Yếu</option>
                                <option value="Loại V: Rất yếu" ${cfg.plKetLuan.includes('Loại V') ? 'selected' : ''}>Loại V: Rất yếu</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">BS Kết luận:</label>
                            <input id="cfg-doc-ketluan" type="text" value="${cfg.docKetLuan}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 11px; text-align: center;" title="BS 02 (Nguyễn Thị Nga)">
                        </div>
                        <div>
                            <label style="font-size: 10px; color: #595959;">Giờ kết thúc:</label>
                            <input id="cfg-gio-kt" type="text" value="${cfg.gioKetThuc}" style="width: 100%; padding: 4px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 11px; text-align: center;">
                        </div>
                    </div>
                    <div style="margin-top: 6px;">
                        <label style="font-size: 11px; color: #262626; cursor: pointer; font-weight: 500;">
                            <input id="cfg-auto-save" type="checkbox" ${cfg.autoSave ? 'checked' : ''}> Tự động bấm Lưu (F11) sau khi điền
                        </label>
                    </div>
                </div>

                <!-- 4. HÀNH ĐỘNG -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <button id="btn-fill-td-only" style="padding: 9px 6px; background: #fa8c16; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(250,140,22,0.35);">
                        ⚡ Điền Tiếp Đón (*)
                    </button>
                    <button id="btn-save-cfg-only" style="padding: 9px 6px; background: #1890ff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(24,144,255,0.35);">
                        💾 Lưu Thông Số
                    </button>
                </div>

                <button id="his-panel-run-btn" style="width: 100%; padding: 11px; background: #52c41a; color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 3px 10px rgba(82,196,26,0.4);">
                    🚀 ĐIỀN KHÁM THEO BẢNG & LƯU (F9)
                </button>

                <div id="his-panel-status" style="text-align: center; margin-top: 8px; font-weight: bold; color: #52c41a; font-size: 11px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        const inputs = panel.querySelectorAll('input, select');
        inputs.forEach(inp => {
            inp.addEventListener('change', () => {
                const updated = readConfigFromUI();
                saveConfig(updated);
            });
        });

        let isCollapsed = false;
        const body = document.getElementById('his-panel-body');
        const toggleBtn = document.getElementById('his-panel-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                isCollapsed = !isCollapsed;
                body.style.display = isCollapsed ? 'none' : 'block';
                toggleBtn.innerText = isCollapsed ? '➕ Mở rộng' : '➖ Thu nhỏ';
            };
        }

        const reloadBtn = document.getElementById('his-panel-reload-btn');
        if (reloadBtn) {
            reloadBtn.onclick = () => {
                panel.remove();
                mountControlPanel();
            };
        }

        const statusEl = document.getElementById('his-panel-status');

        const btnTdOnly = document.getElementById('btn-fill-td-only');
        if (btnTdOnly) btnTdOnly.onclick = () => fillTiepDonConfig(statusEl);

        const btnSaveCfg = document.getElementById('btn-save-cfg-only');
        if (btnSaveCfg) {
            btnSaveCfg.onclick = () => {
                const c = readConfigFromUI();
                saveConfig(c);
                if (statusEl) statusEl.innerText = '💾 Đã lưu cấu hình thông số thành công!';
            };
        }

        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) runBtn.onclick = handleRunClick;
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            e.preventDefault();
            handleRunClick();
        }
    });

    mountControlPanel();
    if (window._hisAutoRemountTimer) clearInterval(window._hisAutoRemountTimer);
    window._hisAutoRemountTimer = setInterval(mountControlPanel, 1500);

})();
