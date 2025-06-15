import createHttpError, { type HttpError } from 'http-errors';
import { client } from '../utils/axios';
import { AxiosError } from 'axios';
import { load, type CheerioAPI, type SelectorType } from 'cheerio';
import { type Element } from 'domhandler';
import { ScrapedHomePage } from '../types/parsers/index';

async function scrapeHomePage(): Promise<ScrapedHomePage | HttpError> {
    const res: ScrapedHomePage = {
        releasingManga: [],
        mostViewedManga: {
            day: [],
            week: [],
            month: []
        },
        recentlyUpdatedManga: [],
        newReleaseManga: []
    };
    try {
        // puppeteer.use(StealthPlugin());
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     args: [' --no-sandbox', '--disable-setuid-sandbox', '--dns-prefetch-disable'],
        //     ignoreDefaultArgs: ['--disable-extensions']
        // });
        // const page = await browser.newPage();
        // await page.setJavaScriptEnabled(true);
        // await page.setUserAgent(
        //     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        // );
        // await page.setDefaultNavigationTimeout(20000);
        // await page.goto(SRC_HOME_URL, { waitUntil: 'networkidle2' });
        // const content = await page.content();

        // await browser.close();
        const content = await client.get('/home');

        const $: CheerioAPI = load(content.data);
        const releasingManga: SelectorType = '#top-trending .container .swiper .swiper-wrapper .swiper-slide';
        const mostViewedMangaDay: SelectorType = '#most-viewed .tab-content[data-name="day"] .swiper-slide.unit';
        const mostViewedMangaWeek: SelectorType = '#most-viewed .tab-content[data-name="week"] .swiper-slide.unit';
        const mostViewedMangaMonth: SelectorType = '#most-viewed .tab-content[data-name="month"] .swiper-slide.unit';
        const recentlyUpdatedManga: SelectorType = '.tab-content[data-name="all"] .unit';
        const newReleaseManga: SelectorType = ' .swiper-container .swiper.completed  .card-md .swiper-slide.unit';

        $(releasingManga).each((i: number, el: Element) => {
            res.releasingManga.push({
                id: $(el).find('.info .above a')?.attr('href') || null,
                status: $(el).find('.info .above span')?.text()?.trim() || null,
                name: $(el).find('.info .above a')?.text()?.trim() || null, // Extracting the text instead of assigning the Cheerio object
                description: $(el).find('.info .below span')?.text()?.trim() || null,
                currentChapter: $(el).find('.info .below p')?.text()?.trim() || null,
                genres:
                    $(el)
                        .find('.info .below div a')
                        ?.map((i: number, el: Element) => $(el).text().trim())
                        .get() || null,
                poster: $(el).find('.swiper-inner a div img')?.attr('src')?.trim() || null
            });
        });
                                $(mostViewedMangaDay).each((i: number, el: Element) => {
            res.mostViewedManga.day.push({
                id: $(el).find('a')?.attr('href') || null,
                name: $(el).find('a span')?.text()?.trim() || null,
                rank: $(el).find('a b')?.text()?.trim() || null,
                poster: $(el).find('a .poster img')?.attr('src')?.trim() || null
            });
        });
                                $(mostViewedMangaWeek).each((i: number, el: Element) => {
            res.mostViewedManga.week.push({
                id: $(el).find('a')?.attr('href') || null,
                name: $(el).find('a span')?.text()?.trim() || null,
                rank: $(el).find('a b')?.text()?.trim() || null,
                poster: $(el).find('a .poster img')?.attr('src')?.trim() || null
            });
        });
                                $(mostViewedMangaMonth).each((i: number, el: Element) => {
            res.mostViewedManga.month.push({
                id: $(el).find('a')?.attr('href') || null,
                name: $(el).find('a span')?.text()?.trim() || null,
                rank: $(el).find('a b')?.text()?.trim() || null,
                poster: $(el).find('a .poster img')?.attr('src')?.trim() || null
            });
        });
                                $(recentlyUpdatedManga).each((i: number, el: Element) => {
            res.recentlyUpdatedManga.push({
                id: $(el).find('.inner > a')?.attr('href') || null,
                name: $(el).find('.info > a')?.text()?.trim() || null,
                poster: $(el).find('.inner > a img')?.attr('src')?.trim() || null,
                type: $(el).find('.inner .info div .type')?.text()?.trim() || null,
                latestChapters:
                    $(el)
                        .find('.info .content[data-name="chap"] li')
                        ?.map((i: number, chapterEl: Element) => ({
                            id: $(chapterEl).find('a')?.attr('href') || null,
                            chapterName: $(chapterEl).find('a span').first().text().trim(),
                            releaseTime: $(chapterEl).find('a span').last().text().trim()
                        }))
                        .get() || null
            });
        });
                                $(newReleaseManga).each((i: number, el: Element) => {
            res.newReleaseManga.push({
                id: $(el).find('a')?.attr('href') || null,
                name: $(el).find('a span')?.text()?.trim() || null,
                poster: $(el).find('a .poster img')?.attr('src')?.trim() || null
            });
        });

        return res;
    } catch (err: any) {
        if (err instanceof AxiosError) {
            throw createHttpError(err?.response?.status || 500, err?.response?.statusText || 'Something went wrong');
        }
        throw createHttpError.InternalServerError(err?.message);
    }
    // or handle the error in a different way
}

export default scrapeHomePage;
