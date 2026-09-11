// ==UserScript==
// @name         HIS V2 - Tự Động Điền Khám Sức Khỏe & Tiếp Đón
// @namespace    http://tampermonkey.net/
// @version      4.3
// @description  Tự động điền Tiếp đón (Nghề nghiệp, Mẫu KSK, Đối tượng KSK, Nguồn kinh phí, Lý do KSK) & Điền Thể lực (Mạch, Huyết áp), Khám lâm sàng + Kết luận tự động lưu trên hệ thống v20.ytecoso.vn
// @author       ThanhThe
// @match        https://v20.ytecoso.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const delay = ms => new Promise(r => setTimeout(r, ms));

    const setAngularValue = (el, value) => {
        if (!el) return;
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    };

    // Chuyển tab cấp 1 (Bàn làm việc / Tiếp đón khám sức khoẻ / Khám sức khỏe định kỳ)
    const clickMainTab = async (tabName) => {
        const tabs = Array.from(document.querySelectorAll('.tab-app-main .ant-tabs-tab, .ant-tabs-tab'));
        const tab = tabs.find(t => t.innerText.trim() === tabName || t.innerText.includes(tabName));
        if (tab) {
            tab.click();
            await delay(300);
            return true;
        }
        return false;
    };

    // Chuyển tab cấp 2 dọc (HÀNH CHÍNH / TIỀN SỬ / THỂ LỰC / KHÁM LÂM SÀNG / KẾT LUẬN)
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

    // Chọn option trong nz-select thông qua ô tìm kiếm
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

    // ----------------------------------------------------
    // 1. KHÂU 1: ĐIỀN CẤU HÌNH TIẾP ĐÓN KHÁM SỨC KHỎE
    // ----------------------------------------------------
    async function fillTiepDonConfig(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang điền cấu hình Tiếp đón...';

        await clickMainTab('Tiếp đón khám sức khoẻ');

        const topPanes = Array.from(document.querySelectorAll('.tab-app-main > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane'));
        const pane = topPanes[1] || document.querySelector('.ant-tabs-tabpane-active') || document;

        const timeInputs = Array.from(pane.querySelectorAll('input[placeholder="__:__"]'));
        if (timeInputs[0]) setAngularValue(timeInputs[0], "07:30");

        const selects = Array.from(pane.querySelectorAll('nz-select'));

        if (selects[6]) await selectOption(selects[6], "00000", "Khác, Không xác định");
        if (selects[10]) await selectOption(selects[10], "từ đủ 18 tuổi trở lên");
        if (selects[11]) await selectOption(selects[11], "Các đối tượng khác");
        if (selects[12]) await selectOption(selects[12], "Xã hội hoá");

        const taLyDo = pane.querySelector('textarea[name="lyDoVaoVien"]') || pane.querySelector('textarea');
        if (taLyDo) setAngularValue(taLyDo, "Khám sức khoẻ định kỳ");

        if (statusEl) statusEl.innerText = '✅ Đã điền xong cấu hình Tiếp đón (Nghề nghiệp, Mẫu KSK, Đối tượng, Kinh phí, Lý do)!';
    }

    // ----------------------------------------------------
    // 2. KHÂU 2: ĐIỀN THỂ LỰC (MẠCH, HUYẾT ÁP), LÂM SÀNG & KẾT LUẬN
    // ----------------------------------------------------
    async function fillKhamLamSangVaKetLuan(statusEl) {
        if (statusEl) statusEl.innerText = '⏳ Đang chuyển sang Khám sức khỏe định kỳ...';

        // 1. Chuyển sang tab Khám sức khỏe định kỳ
        await clickMainTab('Khám sức khỏe định kỳ');

        // 2. Điền Thể lực (Mạch & Huyết áp) nếu có giá trị
        const machVal = document.getElementById('his-inp-mach')?.value?.trim();
        const haVal = document.getElementById('his-inp-ha')?.value?.trim();

        if (machVal || haVal) {
            if (statusEl) statusEl.innerText = `⏳ Đang điền Thể lực (Mạch: ${machVal || '--'}, HA: ${haVal || '--'})...`;
            await clickSubTab('THỂ LỰC');
            const paneTL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;
            const inputsTL = Array.from(paneTL.querySelectorAll('input'));

            if (machVal && inputsTL[3]) setAngularValue(inputsTL[3], machVal);

            const bpHolder = paneTL.querySelector('input[name="huyet_ap"]') || inputsTL[4];
            if (haVal && bpHolder) setAngularValue(bpHolder, haVal);

            const radiosTL = Array.from(paneTL.querySelectorAll('.ant-radio-wrapper'));
            const rLoai2 = radiosTL.find(r => r.innerText.includes('Loại 2'));
            if (rLoai2 && !rLoai2.classList.contains('ant-radio-wrapper-checked')) rLoai2.click();
            await delay(250);
        }

        // 3. Điền KHÁM LÂM SÀNG
        if (statusEl) statusEl.innerText = '⏳ Đang điền Khám Lâm Sàng...';
        await clickSubTab('KHÁM LÂM SÀNG');
        const paneLS = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        // 3.1 Điền nội dung textareas 16 chuyên khoa
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
            "",                                                                 // 10: Sản phụ khoa -> BỎ TRỐNG
            "Hiện tại bình thường",                                             // 11: Mắt khác
            "Hiện tại bình thường",                                             // 12: TMH
            "Bình thường",                                                      // 13: Hàm trên
            "Bình thường",                                                      // 14: Hàm dưới
            "Hiện tại bình thường"                                              // 15: RHM
        ];
        for (let i = 0; i < defaultTexts.length; i++) {
            if (i === 10) continue; // Sản phụ khoa: BỎ QUA HOÀN TOÀN
            if (textareasLS[i]) setAngularValue(textareasLS[i], defaultTexts[i]);
        }

        // 3.2 Điền thị lực Mắt: Không kính P = 6, T = 7; Có kính BỎ TRỐNG
        const inpKKPhai = paneLS.querySelector('input[name="khong_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[0];
        const inpKKTrai = paneLS.querySelector('input[name="khong_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[1];
        const inpCKPhai = paneLS.querySelector('input[name="co_kinh_mat_phai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[2];
        const inpCKTrai = paneLS.querySelector('input[name="co_kinh_mat_trai"]') || paneLS.querySelectorAll('input[placeholder="Nhập giá trị từ 0 đến 10"]')[3];

        if (inpKKPhai) setAngularValue(inpKKPhai, "6");
        if (inpKKTrai) setAngularValue(inpKKTrai, "7");
        if (inpCKPhai) setAngularValue(inpCKPhai, "");
        if (inpCKTrai) setAngularValue(inpCKTrai, "");

        // 3.3 Điền thính lực Tai Mũi Họng (5m / 0.5m)
        const inputsTai = Array.from(paneLS.querySelectorAll('input[placeholder="m"]'));
        if (inputsTai[0]) setAngularValue(inputsTai[0], "5");
        if (inputsTai[1]) setAngularValue(inputsTai[1], "0.5");
        if (inputsTai[2]) setAngularValue(inputsTai[2], "5");
        if (inputsTai[3]) setAngularValue(inputsTai[3], "0.5");

        // 3.4 Phân loại & Bác sĩ chuyên khoa
        const selectsLS = Array.from(paneLS.querySelectorAll('nz-select'));
        for (let i = 0; i < selectsLS.length; i += 2) {
            if (i === 20) continue; // Sản phụ khoa: BỎ QUA HOÀN TOÀN

            if (selectsLS[i]) await selectOption(selectsLS[i], "Loại II: Khỏe");

            if (selectsLS[i + 1]) {
                let docCode = "04";
                let docName = "Tô Chí Sơn";

                if (i === 16 || i === 18) {
                    docCode = "06";
                    docName = "Mai Ngọc Tuấn";
                } else if (i === 22 || i === 24 || i === 26) {
                    docCode = "24";
                    docName = "Nguyễn Thị Dung";
                }

                await selectOption(selectsLS[i + 1], docCode, docName);
            }
        }

        // 4. CHUYỂN SANG TAB KẾT LUẬN
        if (statusEl) statusEl.innerText = '⏳ Đang điền Kết Luận...';
        await clickSubTab('KẾT LUẬN');
        const paneKL = document.querySelector('.vertical-tabs .ant-tabs-tabpane-active') || document;

        // 4.1 Chọn Phân loại sức khỏe: Loại II: Khỏe
        const cbsKL = Array.from(paneKL.querySelectorAll('.ant-checkbox-wrapper'));
        const cbLoai2 = cbsKL.find(c => c.innerText.includes('Loại II: Khỏe') || c.innerText.includes('Loại II:'));
        if (cbLoai2 && !cbLoai2.classList.contains('ant-checkbox-wrapper-checked')) {
            cbLoai2.click();
        }
        const otherCbs = cbsKL.filter(c => c.innerText.includes('Loại I:') || c.innerText.includes('Loại III') || c.innerText.includes('Loại IV') || c.innerText.includes('Loại V'));
        otherCbs.forEach(c => {
            if (c.classList.contains('ant-checkbox-wrapper-checked')) c.click();
        });

        // 4.2 Tick "Xác nhận kết thúc khám"
        const cbKetThuc = cbsKL.find(c => c.innerText.includes('Xác nhận kết thúc khám') || c.closest('div')?.innerText?.includes('Xác nhận kết thúc khám')) || cbsKL[cbsKL.length - 1];
        if (cbKetThuc && !cbKetThuc.classList.contains('ant-checkbox-wrapper-checked')) {
            cbKetThuc.click();
        }

        // 4.3 Bác sĩ kết luận: BS 02 (Nguyễn Thị Nga)
        const selectsKL = Array.from(paneKL.querySelectorAll('nz-select'));
        const docSelectKL = selectsKL[1] || selectsKL[selectsKL.length - 1];
        if (docSelectKL) {
            await selectOption(docSelectKL, "02", "Nguyễn Thị Nga");
        }

        // 4.4 Giờ kết thúc: 07:45
        const timeInput = paneKL.querySelector('input[placeholder="__:__"]');
        if (timeInput) {
            const curVal = timeInput.value || '';
            const morningVal = curVal.includes(':') ? curVal.replace(/^\d{1,2}/, '07') : '07:45';
            setAngularValue(timeInput, morningVal);
        }

        // 4.5 Tự động bấm Lưu (F11)
        if (statusEl) statusEl.innerText = '⏳ Đang bấm Lưu...';
        await delay(350);
        const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Lưu' || b.innerText.includes('Lưu (F11)'));
        if (saveBtn) {
            saveBtn.click();
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG & ĐÃ LƯU (Mạch 80, HA 100/60, Loại II)!';
        } else {
            if (statusEl) statusEl.innerText = '✅ ĐÃ ĐIỀN XONG (Vui lòng bấm Lưu)!';
        }
    }

    let isRunning = false;

    // ----------------------------------------------------
    // 3. QUY TRÌNH TOÀN DIỆN (TIẾP ĐÓN -> KHÁM KSK -> TỰ ĐỘNG LƯU)
    // ----------------------------------------------------
    async function runFullWorkflow() {
        if (isRunning) return;
        isRunning = true;
        const statusEl = document.getElementById('his-panel-status');
        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.innerText = '⏳ Đang thực hiện quy trình...';
        }

        try {
            const activeTopTab = document.querySelector('.tab-app-main .ant-tabs-tab-active')?.innerText || '';
            if (activeTopTab.includes('Tiếp đón')) {
                await fillTiepDonConfig(statusEl);
                await delay(500);
            }
            await fillKhamLamSangVaKetLuan(statusEl);
        } catch (e) {
            console.error('Lỗi tự động hóa:', e);
            if (statusEl) statusEl.innerText = '❌ Lỗi: ' + e.message;
        } finally {
            isRunning = false;
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.innerText = '🚀 TỰ ĐỘNG ĐIỀN & LƯU (F9)';
            }
        }
    }

    // ----------------------------------------------------
    // 4. BẢNG ĐIỀU KHIỂN GIAO DIỆN (PANEL) TRỰC QUAN
    // ----------------------------------------------------
    function mountControlPanel() {
        if (document.getElementById('his-tool-control-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'his-tool-control-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '15px';
        panel.style.right = '15px';
        panel.style.width = '390px';
        panel.style.backgroundColor = '#ffffff';
        panel.style.borderRadius = '12px';
        panel.style.boxShadow = '0 12px 35px rgba(0,0,0,0.4)';
        panel.style.zIndex = '2147483647';
        panel.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        panel.style.border = '2px solid #fa8c16';
        panel.style.overflow = 'hidden';

        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #fa8c16, #ff7a45); color: white; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 13px;">
                <span>⚡ BẢNG ĐIỀU KHIỂN - TỰ ĐỘNG ĐIỀN HIS V2</span>
                <div>
                    <button id="his-panel-reload-btn" title="Tải lại bảng điều khiển" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 7px; margin-right: 4px;">🔄</button>
                    <button id="his-panel-toggle-btn" style="background: rgba(255,255,255,0.25); border: none; color: white; font-size: 12px; cursor: pointer; border-radius: 4px; padding: 2px 8px;">➖ Thu nhỏ</button>
                </div>
            </div>
            <div id="his-panel-body" style="padding: 12px; font-size: 12px; color: #262626; line-height: 1.5;">
                <div style="background: #f0f5ff; border: 1px solid #adc6ff; padding: 8px 10px; border-radius: 6px; margin-bottom: 8px;">
                    <b style="color: #1d39c4;">🩺 Thể lực mẫu:</b>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 5px;">
                        <div>
                            <label style="font-size: 11px; color: #595959;">Mạch (lần/phút):</label>
                            <input id="his-inp-mach" type="text" value="80" style="width: 100%; padding: 4px 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 12px; color: #1d39c4;">
                        </div>
                        <div>
                            <label style="font-size: 11px; color: #595959;">Huyết áp (mmHg):</label>
                            <input id="his-inp-ha" type="text" value="100/60" style="width: 100%; padding: 4px 6px; border: 1px solid #d9d9d9; border-radius: 4px; font-weight: bold; font-size: 12px; color: #1d39c4;">
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <button id="btn-fill-td-only" style="padding: 9px 6px; background: #fa8c16; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(250,140,22,0.35);">
                        ⚡ 1. Điền Tiếp Đón
                    </button>
                    <button id="btn-fill-ls-only" style="padding: 9px 6px; background: #1890ff; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; box-shadow: 0 2px 6px rgba(24,144,255,0.35);">
                        🩺 2. Khám & Lưu
                    </button>
                </div>

                <button id="his-panel-run-btn" style="width: 100%; padding: 10px; background: #52c41a; color: white; border: none; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 3px 8px rgba(82,196,26,0.35);">
                    🚀 TỰ ĐỘNG ĐIỀN & LƯU (F9)
                </button>

                <div id="his-panel-status" style="text-align: center; margin-top: 8px; font-weight: bold; color: #52c41a; font-size: 11px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

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

        const btnLsOnly = document.getElementById('btn-fill-ls-only');
        if (btnLsOnly) btnLsOnly.onclick = () => fillKhamLamSangVaKetLuan(statusEl);

        const runBtn = document.getElementById('his-panel-run-btn');
        if (runBtn) runBtn.onclick = runFullWorkflow;
    }

    // Lắng nghe phím tắt F9
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            e.preventDefault();
            runFullWorkflow();
        }
    });

    // Khởi tạo và tự động remount khi chuyển tab
    mountControlPanel();
    if (window._hisAutoRemountTimer) clearInterval(window._hisAutoRemountTimer);
    window._hisAutoRemountTimer = setInterval(mountControlPanel, 1500);

})();
